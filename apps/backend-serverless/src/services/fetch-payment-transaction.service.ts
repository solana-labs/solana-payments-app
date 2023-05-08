import axios from 'axios'
import { buildPaymentTransactionRequestEndpoint } from '../utilities/endpoints.utility.js'
import {
    TransactionRequestResponse,
    parseAndValidateTransactionRequestResponse,
} from '../models/transaction-request-response.model.js'
import { PaymentRecord } from '@prisma/client'

export const fetchPaymentTransaction = async (
    paymentRecord: PaymentRecord,
    account: string,
    gas: string
): Promise<TransactionRequestResponse> => {
    const endpoint = buildPaymentTransactionRequestEndpoint(
        'ExvbioyTPuFivNJjPcYiCbHijTWPAHzfRXHnAmA4cyRx',
        account,
        'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
        'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
        gas,
        '1',
        'size',
        'blockhash',
        'true'
    )
    const headers = {
        'Content-Type': 'application/x-www-form-urlencoded',
    }

    const response = await axios.post(
        endpoint,
        { account: account },
        { headers: headers }
    )

    if (response.status != 200) {
        throw new Error('Error fetching payment transaction.')
    }

    let paymentTransactionResponse: TransactionRequestResponse

    try {
        paymentTransactionResponse = parseAndValidateTransactionRequestResponse(
            response.data
        )
    } catch (error) {
        if (error instanceof Error) {
            throw error
        } else {
            throw new Error(
                'Could not parse transaction response. Unknown Reason.'
            )
        }
    }

    return paymentTransactionResponse
}
