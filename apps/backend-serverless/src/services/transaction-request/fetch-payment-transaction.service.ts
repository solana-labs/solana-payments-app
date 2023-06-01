import axios from 'axios';
import { buildPaymentTransactionRequestEndpoint } from '../../utilities/transaction-request/endpoints.utility.js';
import {
    TransactionRequestResponse,
    parseAndValidateTransactionRequestResponse,
} from '../../models/transaction-requests/transaction-request-response.model.js';
import { Merchant, PaymentRecord } from '@prisma/client';
import { USDC_MINT } from '../../configs/tokens.config.js';

export const fetchPaymentTransaction = async (
    paymentRecord: PaymentRecord,
    merchant: Merchant,
    account: string,
    gas: string,
    singleUseNewAcc: string,
    singleUsePayer: string,
    axiosInstance: typeof axios
): Promise<TransactionRequestResponse> => {
    if (merchant.paymentAddress == null) {
        throw new Error('Merchant payment address not found.');
    }

    // 6 because USDC is 6 decimal places
    var paymentAmount = paymentRecord.usdcAmount.toPrecision(6);

    // Allow for testing values
    if (
        paymentRecord.test == true &&
        process.env.TEST_USDC_SIZE != null &&
        isNaN(parseFloat(process.env.TEST_USDC_SIZE || '')) == false
    ) {
        paymentAmount = process.env.TEST_USDC_SIZE;
    }

    const endpoint = buildPaymentTransactionRequestEndpoint(
        merchant.paymentAddress,
        account,
        USDC_MINT.toBase58(),
        USDC_MINT.toBase58(),
        gas,
        paymentAmount,
        'size',
        'blockhash',
        'true',
        singleUseNewAcc,
        singleUsePayer,
        'test-one,test-two'
    );
    const headers = {
        'Content-Type': 'application/x-www-form-urlencoded', // TODO: I think i need to make this json
    };

    const response = await axiosInstance.post(endpoint, { account: account }, { headers: headers });

    if (response.status != 200) {
        throw new Error('Error fetching payment transaction.');
    }

    let paymentTransactionResponse: TransactionRequestResponse;

    try {
        paymentTransactionResponse = parseAndValidateTransactionRequestResponse(response.data);
    } catch (error) {
        if (error instanceof Error) {
            throw error;
        } else {
            throw new Error('Could not parse transaction response. Unknown Reason.');
        }
    }

    return paymentTransactionResponse;
};
