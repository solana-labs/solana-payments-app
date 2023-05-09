import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { PaymentRecord, PrismaClient, TransactionType } from '@prisma/client'
import { requestErrorResponse } from '../utilities/request-response.utility.js'
import { TransactionRequestResponse } from '../models/transaction-request-response.model.js'
import { fetchPaymentTransaction } from '../services/fetch-payment-transaction.service.js'
import {
    PaymentTransactionRequest,
    parseAndValidatePaymentTransactionRequest,
} from '../models/payment-transaction-request.model.js'
import { encodeBufferToBase58 } from '../utilities/encode-transaction.utility.js'
import { decode } from '../utilities/string.utility.js'
import queryString from 'query-string'
import { encodeTransaction } from '../utilities/encode-transaction.utility.js'
import { web3 } from '@project-serum/anchor'
import { fetchGasKeypair } from '../services/fetch-gas-keypair.service.js'
import { TransactionRecordService } from '../services/database/transaction-record-service.database.service.js'
import { PaymentRecordService } from '../services/database/payment-record-service.database.service.js'

export const paymentTransaction = async (
    event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
    let paymentRecord: PaymentRecord | null
    let paymentTransaction: TransactionRequestResponse
    let paymentRequest: PaymentTransactionRequest
    let transaction: web3.Transaction

    const prisma = new PrismaClient()
    const transactionRecordService = new TransactionRecordService(prisma)
    const paymentRecordService = new PaymentRecordService(prisma)

    const decodedBody = event.body ? decode(event.body) : ''
    const body = queryString.parse(decodedBody)
    const account = body['account'] as string | null

    if (account == null) {
        return requestErrorResponse(new Error('No account provided.'))
    }

    try {
        paymentRequest = parseAndValidatePaymentTransactionRequest(
            event.queryStringParameters
        )
    } catch (error) {
        return requestErrorResponse(error)
    }

    const gasKeypair = await fetchGasKeypair()

    try {
        paymentRecord = await paymentRecordService.getPaymentRecord({
            id: paymentRequest.paymentId,
        })
    } catch (error) {
        return requestErrorResponse(error)
    }

    if (paymentRecord == null) {
        return requestErrorResponse(new Error('Payment record not found.'))
    }

    try {
        paymentTransaction = await fetchPaymentTransaction(
            paymentRecord,
            account,
            gasKeypair.publicKey.toBase58()
        )
    } catch (error) {
        return requestErrorResponse(error)
    }

    try {
        transaction = encodeTransaction(paymentTransaction.transaction)
    } catch (error) {
        return requestErrorResponse(error)
    }

    transaction.sign(gasKeypair)
    const transactionSignature = transaction.signature

    if (transactionSignature == null) {
        return requestErrorResponse(new Error('No transaction signature.'))
    }

    const signatureBuffer = transactionSignature

    const signatureString = encodeBufferToBase58(signatureBuffer)

    try {
        const transactionRecord =
            await transactionRecordService.createTransactionRecord(
                signatureString,
                TransactionType.payment,
                paymentRecord.id,
                null,
                'fake-dat'
            )
    } catch (error) {
        return requestErrorResponse(error)
    }

    const transactionBuffer = transaction.serialize({
        verifySignatures: false,
        requireAllSignatures: false,
    })
    const transactionString = transactionBuffer.toString('base64')

    return {
        statusCode: 200,
        body: JSON.stringify(
            {
                transaction: transactionString,
                message: 'gm',
            },
            null,
            2
        ),
    }
}

export const paymentMetadata = async (
    event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
    return {
        statusCode: 200,
        body: JSON.stringify(
            {
                label: 'Solana Payment App',
                icon: 'https://solana.com/_next/image?url=%2F_next%2Fstatic%2Fmedia%2FsolanaGradient.cc822962.png&w=3840&q=75',
            },
            null,
            2
        ),
    }
}
