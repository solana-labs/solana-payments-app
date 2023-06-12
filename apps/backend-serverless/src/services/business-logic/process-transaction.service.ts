import { PrismaClient, WebsocketSession } from '@prisma/client';
import { TransactionRecordService } from '../database/transaction-record-service.database.service.js';
import { getRecordServiceForTransaction } from '../database/record-service.database.service.js';
import { MerchantService } from '../database/merchant-service.database.service.js';
import {
    verifyRecordWithHeliusTranscation,
    verifyTransactionWithRecord,
} from '../transaction-validation/validate-discovered-payment-transaction.service.js';
import { HeliusEnhancedTransaction } from '../../models/dependencies/helius-enhanced-transaction.model.js';
import * as web3 from '@solana/web3.js';
import { delay } from '../../utilities/delay.utility.js';
import { fetchTransaction } from '../fetch-transaction.service.js';
import { sendWebsocketMessage } from '../websocket/send-websocket-message.service.js';

export const processTransaction = async (
    heliusTransaction: HeliusEnhancedTransaction,
    prisma: PrismaClient,
    websocketSessions: WebsocketSession[]
) => {
    const transactionRecordService = new TransactionRecordService(prisma);
    const merchantService = new MerchantService(prisma);

    const transactionRecord = await transactionRecordService.getTransactionRecord({
        signature: heliusTransaction.signature,
    });

    if (transactionRecord == null) {
        throw new Error('Transaction record not found');
    }

    const recordService = await getRecordServiceForTransaction(transactionRecord, prisma);

    const record = await recordService.getRecord(transactionRecord);

    if (record == null) {
        throw new Error('Record not found');
    }

    const merchant = await merchantService.getMerchant({ id: record.merchantId });

    if (merchant == null) {
        throw new Error('Merchant not found');
    }

    if (merchant.accessToken == null) {
        throw new Error('Merchant access token not found');
    }

    verifyRecordWithHeliusTranscation(record, heliusTransaction, true);

    let rpcTransaction: web3.Transaction | null = null;

    while (rpcTransaction == null) {
        try {
            await delay(3000);
            rpcTransaction = await fetchTransaction(heliusTransaction.signature);
        } catch (error) {}
    }

    verifyTransactionWithRecord(record, rpcTransaction, true);

    await recordService.updateRecordToPaid(record.id, heliusTransaction.signature);

    // now i need to make the update to shopify

    await recordService.updateRecordToCompleted(record.id, 'https://www.google.com');

    for (const websocketSession of websocketSessions) {
        try {
            await sendWebsocketMessage(websocketSession.connectionId, {
                messageType: 'completedDetails',
                completedDetails: {
                    redirectUrl: 'https://www.google.com',
                },
            });
        } catch (error) {
            // prob just closed and orphaned
            continue;
        }
    }
};
