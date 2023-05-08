import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import {
    PaymentRecord,
    PrismaClient,
    RefundRecord,
    TransactionType,
} from '@prisma/client'
import { fetchGasKeypair } from '../services/fetch-gas-keypair.service.js'
import queryString from 'query-string'
import { decode } from '../utilities/string.utility.js'
import { requestErrorResponse } from '../utilities/request-response.utility.js'
import {
    RefundTransactionRequest,
    parseAndValidateRefundTransactionRequest,
} from '../models/refund-transaction-request.model.js'
import { web3 } from '@project-serum/anchor'
import { TransactionRequestResponse } from '../models/transaction-request-response.model.js'
import {
    encodeBufferToBase58,
    encodeTransaction,
} from '../utilities/encode-transaction.utility.js'
import { fetchRefundTransaction } from '../services/fetch-refund-transaction.service.js'

export const refundTransaction = async (
    event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
    const prisma = new PrismaClient()

    let refundRecord: RefundRecord
    let refundRequest: RefundTransactionRequest
    let refundTransaction: TransactionRequestResponse
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

    // this sould def be a service to fetch a refund transaction, but i would
    // imagine under the hood we can reuse most of the logic
    // from this moment on, what's happening?
    // 1. we get the transaction from the TRS
    // 2. we encode it into a transaction object
    // 3. we sign it with the gas keypair and veryify the signature
    // 4. we create a transaction record in the db, these could def be different services
    // 5. we serialize the transaction and return it to the client
    try {
        refundTransaction = await fetchRefundTransaction(
            refundRecord,
            account,
            gasKeypair.publicKey.toBase58()
        )
    } catch (error) {
        return requestErrorResponse(error)
    }

    try {
        transaction = encodeTransaction(refundTransaction.transaction)
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
                type: TransactionType.refund,
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
