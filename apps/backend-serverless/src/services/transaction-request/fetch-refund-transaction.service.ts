import axios from 'axios';
import { buildRefundTransactionRequestEndpoint } from '../../utilities/transaction-request/endpoints.utility.js';
import { PaymentRecord, RefundRecord } from '@prisma/client';
import {
    TransactionRequestResponse,
    parseAndValidateTransactionRequestResponse,
} from '../../models/transaction-requests/transaction-request-response.model.js';
import { fetchTransaction } from '../fetch-transaction.service.js';
import { findPayingWalletFromTransaction } from '../../utilities/transaction-inspection.utility.js';
import { USDC_MINT } from '../../configs/tokens.config.js';

export const fetchRefundTransaction = async (
    refundRecord: RefundRecord,
    associatedPaymentRecord: PaymentRecord,
    account: string,
    gas: string,
    singleUseNewAcc: string,
    singleUsePayer: string,
    axiosInstance: typeof axios
): Promise<TransactionRequestResponse> => {
    // We can't refund a payment that doesn't exist
    if (associatedPaymentRecord.transactionSignature == null) {
        throw new Error('Payment transaction not found.');
    }

    // Now we have the transaction that the orginal payment was made in
    // This is also something we could add to a job with sqs to save calls here and then make
    // it easier to populate on merchant-ui read calls
    const transaction = await fetchTransaction(associatedPaymentRecord.transactionSignature);

    const payingCustomerWalletAddress = await findPayingWalletFromTransaction(transaction);

    const endpoint = buildRefundTransactionRequestEndpoint(
        payingCustomerWalletAddress.toBase58(), // this needs to be the customer
        account, // this needs to be passed in from the request but the payment will be the merchant
        USDC_MINT.toBase58(),
        USDC_MINT.toBase58(),
        gas,
        refundRecord.usdcAmount.toFixed(6), // USDC is 6 decimals
        'size',
        'blockhash',
        'true',
        singleUseNewAcc,
        singleUsePayer,
        'test-one,test-two' // TODO: Update these with real values
    );
    const headers = {
        'Content-Type': 'application/json',
    };

    const response = await axiosInstance.post(endpoint, { account: account }, { headers: headers });

    if (response.status != 200) {
        throw new Error('Error fetching refund transaction.');
    }

    const transactionRequestResponse = parseAndValidateTransactionRequestResponse(response.data);

    return transactionRequestResponse;
};
