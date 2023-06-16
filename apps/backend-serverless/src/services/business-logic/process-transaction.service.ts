import { PrismaClient, WebsocketSession } from '@prisma/client';
import { TransactionRecordService } from '../database/transaction-record-service.database.service.js';
import {
    PaymentResolveResponse,
    ShopifyResolveResponse,
    getRecordServiceForTransaction,
} from '../database/record-service.database.service.js';
import { verifyTransactionWithRecord } from '../transaction-validation/validate-discovered-payment-transaction.service.js';
import * as web3 from '@solana/web3.js';
import { delay } from '../../utilities/delay.utility.js';
import { fetchTransaction } from '../fetch-transaction.service.js';
import { WebSocketService } from '../websocket/send-websocket-message.service.js';
import axios from 'axios';
import { TransactionSignatureQuery } from '../database/payment-record-service.database.service.js';

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

    if (transactionRecord == null) {
        throw new Error('Transaction record not found');
    }

    // TODO: Make this a factory class
    const recordService = await getRecordServiceForTransaction(transactionRecord, prisma);

    const record = await recordService.getRecord(transactionRecord);

    if (record == null) {
        throw new Error('Record not found');
    }

    let rpcTransaction: web3.Transaction | null = null;

    while (rpcTransaction == null) {
        try {
            // TODO: play around with lowering this time
            await delay(3000);
            rpcTransaction = await fetchTransaction(signature);
        } catch (error) {}
    }

    verifyTransactionWithRecord(record, rpcTransaction, true);

    await recordService.updateRecordToPaid(record.id, signature);

    let resolveResponse: ShopifyResolveResponse;

    try {
        resolveResponse = await recordService.resolveSession(record, axiosInstance);
    } catch (error) {
        await recordService.sendResolveRetry(record);
        throw error;
    }

    await recordService.updateRecordToCompleted(record.id, resolveResponse);

    // TODO: Make this use generic and the record service
    if (transactionRecord.type == 'payment' && websocketService != null) {
        const redirectUrl = (resolveResponse as PaymentResolveResponse).redirectUrl;

        await websocketService.sendCompletedDetailsMessage({
            redirectUrl,
        });
    }
};
