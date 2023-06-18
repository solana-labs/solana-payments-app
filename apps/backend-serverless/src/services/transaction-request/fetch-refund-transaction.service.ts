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
import { ref } from 'yup';
import { send } from 'process';

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
    // TODO: Figure out if we need to direct it to the exact token account of the customer, probably yes
    const transaction = await fetchTransaction(associatedPaymentRecord.transactionSignature);
    const payingCustomerWalletAddress = await findPayingWalletFromTransaction(transaction);

    const sender = account;
    let receiver = payingCustomerWalletAddress.toBase58();

    if (refundRecord.test) {
        receiver = account;
    }

    const endpoint = buildRefundTransactionRequestEndpoint(
        receiver,
        null,
        sender,
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

    console.log(endpoint);

    const response = await axiosInstance.post(endpoint, { account: account }, { headers: headers });

    console.log(response.status);

    if (response.status != 200) {
        throw new Error('Error fetching refund transaction.');
    }

    console.log(response.status);

    const transactionRequestResponse = parseAndValidateTransactionRequestResponse(response.data);

    console.log(transactionRequestResponse);
    return transactionRequestResponse;
};
