import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { PaymentRecord, PrismaClient, RefundRecord } from '@prisma/client'
import { fetchGasKeypair } from '../services/fetch-gas-keypair.service.js'
import queryString from 'query-string'
import { decode } from '../utilities/string.utility.js'
import { requestErrorResponse } from '../utilities/request-response.utility.js'
import {
    RefundTransactionRequest,
    parseAndValidateRefundTransactionRequest,
} from '../models/refund-transaction-request.model.js'
import { web3 } from '@project-serum/anchor'
import { PaymentTransactionResponse } from '../models/payment-transaction-response.model.js'
import { fetchPaymentTransaction } from '../services/fetch-payment-transaction.service.js'
import {
    encodeBufferToBase58,
    encodeTransaction,
} from '../utilities/encode-transaction.utility.js'

export const refundTransaction = async (
    event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
    const prisma = new PrismaClient()

    let refundRecord: RefundRecord
    let refundRequest: RefundTransactionRequest
    let paymentTransaction: PaymentTransactionResponse
    let transaction: web3.Transaction

    const decodedBody = event.body ? decode(event.body) : ''
    const body = queryString.parse(decodedBody)
    const account = body['account'] as string | null

    if (account == null) {
        return requestErrorResponse(new Error('No account provided.'))
    }

    try {
        refundRequest = parseAndValidateRefundTransactionRequest(
            event.queryStringParameters
        )
    } catch (error) {
        return requestErrorResponse(error)
    }

    const gasKeypair = await fetchGasKeypair()

    try {
        refundRecord = await prisma.refundRecord.findFirstOrThrow({
            where: {
                id: refundRequest.refundId,
            },
        })
    } catch (error) {
        return requestErrorResponse(error)
    }

    try {
        paymentTransaction = await fetchPaymentTransaction(
            refundRecord,
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
        await prisma.transactionRecord.create({
            data: {
                signature: signatureString,
                type: 'payment',
                refundRecordId: refundRecord.id,
                createdAt: 'fake-date-go-here',
            },
        })
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
                message: 'gn',
            },
            null,
            2
        ),
    }
}
