import { PaymentRecord, PrismaClient } from '@prisma/client';
import * as web3 from '@solana/web3.js';
import axios from 'axios';
import { ShopifyRefundInitiation } from '../../models/shopify/process-refund.request.model.js';
import { createPaymentProductNftsResponse } from '../../utilities/clients/create-payment-product-nfts-response.js';
import { delay } from '../../utilities/delay.utility.js';
import { constructTransaction, sendTransaction } from '../../utilities/transaction.utility.js';
import { convertAmountAndCurrencyToUsdcSize } from '../coin-gecko.service.js';
import { MerchantService } from '../database/merchant-service.database.service.js';
import { TransactionSignatureQuery } from '../database/payment-record-service.database.service.js';
import {
    PaymentResolveResponse,
    ShopifyResolveResponse,
    getRecordServiceForTransaction,
} from '../database/record-service.database.service.js';
import { RefundRecordService } from '../database/refund-record-service.database.service.js';
import { TransactionRecordService } from '../database/transaction-record-service.database.service.js';
import { fetchGasKeypair } from '../fetch-gas-keypair.service.js';
import { fetchTransaction } from '../fetch-transaction.service.js';
import { mintCompressedNFT } from '../transaction-request/products-transaction.service.js';
import { WebSocketService } from '../websocket/send-websocket-message.service.js';

function getRandomArbitrary(min: number, max: number): number {
    return Math.random() * (max - min) + min;
}

export const processTransaction = async (
    signature: string,
    prisma: PrismaClient,
    websocketService: WebSocketService<TransactionSignatureQuery> | null,
    axiosInstance: typeof axios
) => {
    const transactionRecordService = new TransactionRecordService(prisma);

    const merchantService = new MerchantService(prisma);
    const transactionRecord = await transactionRecordService.getTransactionRecord({
        signature: signature,
    });

    const recordService = await getRecordServiceForTransaction(transactionRecord, prisma);
    const refundRecordService = new RefundRecordService(prisma);

    const record = await recordService.getRecordFromTransactionRecord(transactionRecord);

    if (record == null) {
        throw new Error('Record not found');
    }

    let rpcTransaction: web3.Transaction | null = null;

    // TODO: If we're gonna time out, we should requeue this
    while (rpcTransaction == null) {
        await delay(500);
        rpcTransaction = await fetchTransaction(signature);
    }

    // verifyTransactionWithRecord(record, rpcTransaction, true);

    await recordService.updateRecordToPaid(record.id, signature);

    let resolveResponse: ShopifyResolveResponse;
    let gasKeypair = await fetchGasKeypair();

    // This is the biggest canidate to fail, and if it does, just retry
    try {
        resolveResponse = await recordService.resolveSession(record, axiosInstance);
    } catch (error) {
        if (websocketService != null) {
            await websocketService.sendShopifyRetryMessage();
        }
        await recordService.sendResolveRetry(record);
        return;
    }

    // CRITICAL: Add this to the retry queue
    await recordService.updateRecordToCompleted(record.id, resolveResponse);

    // REFACTOR: Make this use generic and the record service
    if (transactionRecord.type == 'payment' && websocketService != null) {
        const redirectUrl = (resolveResponse as PaymentResolveResponse).redirectUrl;

        await websocketService.sendCompletedDetailsMessage({
            redirectUrl,
        });
        // TODO Make this fetching user account better
        // @ts-ignore
        await merchantService.recordCustomer(rpcTransaction._json.signers[1], record.merchantId, record.amount);

        const { products } = await createPaymentProductNftsResponse(record as PaymentRecord, merchantService);

        console.log('minting nfts', products);
        console.log('rpc tx', rpcTransaction);
        try {
            const productPromises = products.map(async product => {
                if (product.uri && rpcTransaction._json.signers[1]) {
                    const instructions = await mintCompressedNFT(
                        gasKeypair,
                        new web3.PublicKey(record.merchantId),
                        gasKeypair.publicKey,
                        new web3.PublicKey(rpcTransaction._json.signers[1]),
                        product.name,
                        product.uri
                    );

                    const transaction = await constructTransaction(instructions, gasKeypair.publicKey);
                    transaction.partialSign(gasKeypair);

                    await sendTransaction(transaction);
                }
            });
            await Promise.all(productPromises);
        } catch (error) {
            console.log('error minting compressed', error);
        }
        if (process.env.NODE_ENV === 'development') {
            console.log('making the refund record dev');
            const id = getRandomArbitrary(1, 1000000).toString();
            const gid = getRandomArbitrary(1, 1000000).toString();

            let refundInitiation: ShopifyRefundInitiation = {
                id: gid,
                gid: 'refundSession//' + gid,
                payment_id: record.shopId,
                amount: record.amount,
                currency: record.currency,
                test: record.test,
                merchant_locale: 'us',
                proposed_at: new Date().toISOString(),
            };

            let usdcSize: number;

            if (refundInitiation.test) {
                usdcSize = 0.01;
            } else {
                usdcSize = await convertAmountAndCurrencyToUsdcSize(
                    refundInitiation.amount,
                    refundInitiation.currency,
                    axios
                );
            }

            await refundRecordService.createRefundRecord(id, refundInitiation, record.merchantId, usdcSize);
        }
    }
};
