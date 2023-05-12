import axios from 'axios';
import { buildRefundTransactionRequestEndpoint } from '../../utilities/endpoints.utility.js';
import { RefundRecord } from '@prisma/client';
import {
    TransactionRequestResponse,
    parseAndValidateTransactionRequestResponse,
} from '../../models/transaction-request-response.model.js';

export const fetchRefundTransaction = async (
    refundRecord: RefundRecord,
    account: string,
    gas: string
): Promise<TransactionRequestResponse> => {
    const endpoint = buildRefundTransactionRequestEndpoint(
        'ExvbioyTPuFivNJjPcYiCbHijTWPAHzfRXHnAmA4cyRx', // this needs to be the customer
        account, // this needs to be passed in from the request but the payment will be the merchant
        'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
        'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
        gas,
        '0.1', // will leave at 0.1 for now but this should be the size of the refund
        'size',
        'blockhash',
        'true'
    );
    const headers = {
        'Content-Type': 'application/x-www-form-urlencoded',
    };

    const response = await axios.post(endpoint, { account: account }, { headers: headers });

    if (response.status != 200) {
        throw new Error('Error fetching refund transaction.');
    }

    let transactionRequestResponse: TransactionRequestResponse;

    try {
        transactionRequestResponse = parseAndValidateTransactionRequestResponse(response.data);
    } catch (error) {
        if (error instanceof Error) {
            throw error;
        } else {
            throw new Error('Could not parse transaction response. Unknown Reason.');
        }
    }

    return transactionRequestResponse;
};
