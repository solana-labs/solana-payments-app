import { PrismaClient } from '@prisma/client';
import * as web3 from '@solana/web3.js';
import axios from 'axios';
import { delay } from '../../utilities/delay.utility.js';
import { TransactionSignatureQuery } from '../database/payment-record-service.database.service.js';
import {
    PaymentResolveResponse,
    ShopifyResolveResponse,
    getRecordServiceForTransaction,
} from '../database/record-service.database.service.js';
import { TransactionRecordService } from '../database/transaction-record-service.database.service.js';
import { fetchTransaction } from '../fetch-transaction.service.js';
import { verifyTransactionWithRecord } from '../transaction-validation/validate-discovered-payment-transaction.service.js';
import { WebSocketService } from '../websocket/send-websocket-message.service.js';

export const processTransaction = async (
    signature: string,
    prisma: PrismaClient,
    websocketService: WebSocketService<TransactionSignatureQuery> | null,
    axiosInstance: typeof axios,
) => {
    const transactionRecordService = new TransactionRecordService(prisma);

    const transactionRecord = await transactionRecordService.getTransactionRecord({
        signature: signature,
    });

    // This shouldn't happen, we got here because we had a transaction record.
    // If it does, really big problem but doubt there is someone on the other end?
    if (transactionRecord == null) {
        throw new Error('Transaction record not found');
    }

    // TODO: Make this a factory class
    const recordService = await getRecordServiceForTransaction(transactionRecord, prisma);

    const record = await recordService.getRecordFromTransactionRecord(transactionRecord);

    // This shouldn't happen, like ever. We should eventually map out what situations this could happen.
    // And if it doesn, is that bad for a customer or are we throwing too much this way?
    if (record == null) {
        throw new Error('Record not found');
    }

    let rpcTransaction: web3.Transaction | null = null;

    // TODO: If we're gonna time out, we should requeue this
    while (rpcTransaction == null) {
        try {
            await delay(2000);
            rpcTransaction = await fetchTransaction(signature);
        } catch (error) {
            // it's okay if this throws, we don't expect the transaction to be there on the first try. TODO: Check why it failed
        }
    }

    // I really can't even formally justify why we have this, if we have a record and a transaction record, we should
    // be okay with just having the signature. That being said, as long as the logic is good, this should pass every time.
    // If it doesn't we might be building transactions wrong. But, we also make this check before we return the transaction.
    // This is kinda redundancy then? Passed then, passes now?
    verifyTransactionWithRecord(record, rpcTransaction, true);

    // Could always have a rouge db failed
    await recordService.updateRecordToPaid(record.id, signature);

    let resolveResponse: ShopifyResolveResponse;

    // This is the biggest canidate to fail, and if it does, we probably don't want to tell the customer that processing failed.
    // We wana say, hey, you, person with the wallet, you did your job and we're doing ours, sit tight kid. Daddy's got this.
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
    }
};
