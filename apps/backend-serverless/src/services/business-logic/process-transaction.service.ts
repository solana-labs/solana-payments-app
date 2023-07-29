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
    axiosInstance: typeof axios
) => {
    const transactionRecordService = new TransactionRecordService(prisma);

    const transactionRecord = await transactionRecordService.getTransactionRecord({
        signature: signature,
    });

    const recordService = await getRecordServiceForTransaction(transactionRecord, prisma);

    const record = await recordService.getRecordFromTransactionRecord(transactionRecord);

    if (record == null) {
        throw new Error('Record not found');
    }

    let rpcTransaction: web3.Transaction | null = null;

    // TODO: If we're gonna time out, we should requeue this
    while (rpcTransaction == null) {
        await delay(1000);
        rpcTransaction = await fetchTransaction(signature);
    }

    verifyTransactionWithRecord(record, rpcTransaction, true);

    await recordService.updateRecordToPaid(record.id, signature);

    let resolveResponse: ShopifyResolveResponse;

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
    }
};
