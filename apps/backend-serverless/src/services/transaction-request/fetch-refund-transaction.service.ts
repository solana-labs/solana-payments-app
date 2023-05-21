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
    gas: string,
    singleUseNewAcc: string,
    singleUsePayer: string
): Promise<TransactionRequestResponse> => {
    var refundAmount = refundRecord.usdcAmount.toPrecision(4).toString();

    // Allow for testing values
    if (
        refundRecord.test == true &&
        process.env.TEST_USDC_SIZE != null &&
        isNaN(parseFloat(process.env.TEST_USDC_SIZE || '')) == false
    ) {
        refundAmount = process.env.TEST_USDC_SIZE;
    }

    const endpoint = buildRefundTransactionRequestEndpoint(
        'ExvbioyTPuFivNJjPcYiCbHijTWPAHzfRXHnAmA4cyRx', // this needs to be the customer
        account, // this needs to be passed in from the request but the payment will be the merchant
        'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
        'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
        gas,
        refundAmount,
        'size',
        'blockhash',
        'true',
        singleUseNewAcc,
        singleUsePayer
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
