import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { PrismaClient, RefundRecord, TransactionType } from '@prisma/client';
import { fetchGasKeypair } from '../../services/fetch-gas-keypair.service.js';
import queryString from 'query-string';
import { decode } from '../../utilities/string.utility.js';
import { requestErrorResponse } from '../../utilities/request-response.utility.js';
import {
    RefundTransactionRequest,
    parseAndValidateRefundTransactionRequest,
} from '../../models/refund-transaction-request.model.js';
import { web3 } from '@project-serum/anchor';
import { TransactionRequestResponse } from '../../models/transaction-request-response.model.js';
import { encodeBufferToBase58, encodeTransaction } from '../../utilities/encode-transaction.utility.js';
import { fetchRefundTransaction } from '../../services/transaction-request/fetch-refund-transaction.service.js';
import { TransactionRecordService } from '../../services/database/transaction-record-service.database.service.js';
import { RefundRecordService } from '../../services/database/refund-record-service.database.service.js';
import { PaymentRecordService } from '../../services/database/payment-record-service.database.service.js';
import { TrmService } from '../../services/trm-service.service.js';
import { generateSingleUseKeypairFromRefundRecord } from '../../utilities/generate-single-use-keypair.utility.js';
import { MerchantService } from '../../services/database/merchant-service.database.service.js';
import { verifyRefundTransactionWithRefundRecord } from '../../services/transaction-validation/validate-discovered-refund-transaction.service.js';

export const refundTransaction = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    let refundRecord: RefundRecord | null;
    let refundRequest: RefundTransactionRequest;
    let refundTransaction: TransactionRequestResponse;
    let transaction: web3.Transaction;

    const prisma = new PrismaClient();
    const transactionRecordService = new TransactionRecordService(prisma);
    const refundRecordService = new RefundRecordService(prisma);
    const merchantService = new MerchantService(prisma);

    const TRM_API_KEY = process.env.TRM_API_KEY;

    if (TRM_API_KEY == null) {
        return requestErrorResponse(new Error('Missing internal config.'));
    }

    const trmService = new TrmService(TRM_API_KEY);

    const decodedBody = event.body ? decode(event.body) : '';
    const body = queryString.parse(decodedBody);
    const account = body['account'] as string | null;

    if (account == null) {
        return requestErrorResponse(new Error('No account provided.'));
    }

    try {
        refundRequest = parseAndValidateRefundTransactionRequest(event.queryStringParameters);
    } catch (error) {
        return requestErrorResponse(error);
    }

    let gasKeypair: web3.Keypair;

    try {
        gasKeypair = await fetchGasKeypair();
    } catch (error) {
        return requestErrorResponse(error);
    }

    try {
        refundRecord = await refundRecordService.getRefundRecord({
            id: refundRequest.refundId,
        });
    } catch (error) {
        return requestErrorResponse(error);
    }

    if (refundRecord == null) {
        return requestErrorResponse(new Error('No refund record found.'));
    }

    const merchant = await merchantService.getMerchant({
        id: refundRecord.merchantId,
    });

    if (merchant == null) {
        return requestErrorResponse(new Error('Merchant not found.'));
    }

    const singleUseKeypair = await generateSingleUseKeypairFromRefundRecord(refundRecord);

    try {
        refundTransaction = await fetchRefundTransaction(
            refundRecord,
            account,
            gasKeypair.publicKey.toBase58(),
            singleUseKeypair.publicKey.toBase58(),
            gasKeypair.publicKey.toBase58()
        );
    } catch (error) {
        return requestErrorResponse(error);
    }

    try {
        await trmService.screenAddress(account!);
    } catch (error) {
        return requestErrorResponse(error);
    }

    try {
        transaction = encodeTransaction(refundTransaction.transaction);
    } catch (error) {
        return requestErrorResponse(error);
    }

    transaction.partialSign(gasKeypair);
    transaction.partialSign(singleUseKeypair);

    const transactionSignature = transaction.signature;

    if (transactionSignature == null) {
        return requestErrorResponse(new Error('No transaction signature.'));
    }

    try {
        verifyRefundTransactionWithRefundRecord(refundRecord, transaction, true);
    } catch (error) {
        return requestErrorResponse(error);
    }

    const signatureBuffer = transactionSignature;

    const signatureString = encodeBufferToBase58(signatureBuffer);

    try {
        await transactionRecordService.createTransactionRecord(
            signatureString,
            TransactionType.refund,
            null,
            refundRecord.id
        );
    } catch (error) {
        return requestErrorResponse(error);
    }

    const transactionBuffer = transaction.serialize({
        verifySignatures: false,
        requireAllSignatures: false,
    });
    const transactionString = transactionBuffer.toString('base64');

    return {
        statusCode: 200,
        body: JSON.stringify(
            {
                transaction: transactionString,
                message: 'gn',
            },
            null,
            2
        ),
    };
};
