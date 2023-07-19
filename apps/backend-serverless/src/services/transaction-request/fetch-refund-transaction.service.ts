import { PaymentRecord, RefundRecord } from '@prisma/client';
import axios from 'axios';
import { USDC_MINT } from '../../configs/tokens.config.js';
import {
    TransactionRequestResponse,
    parseAndValidateTransactionRequestResponse,
} from '../../models/transaction-requests/transaction-request-response.model.js';
import { findPayingTokenAddressFromTransaction } from '../../utilities/transaction-inspection.utility.js';
import { buildRefundTransactionRequestEndpoint } from '../../utilities/transaction-request/endpoints.utility.js';
import { fetchTransaction } from '../fetch-transaction.service.js';

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
    const payingCustomerTokenAddress = await findPayingTokenAddressFromTransaction(transaction);

    let receiverWalletAddress: string | null = null;
    let receiverTokenAddress: string | null = payingCustomerTokenAddress.toBase58();

    if (refundRecord.test) {
        receiverWalletAddress = account;
        receiverTokenAddress = null;
    }

    const endpoint = buildRefundTransactionRequestEndpoint(
        receiverWalletAddress,
        receiverTokenAddress,
        account,
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

    const response = await axiosInstance.post(endpoint, { headers: headers });

    if (response.status != 200) {
        throw new Error('Error fetching refund transaction.');
    }

    const transactionRequestResponse = parseAndValidateTransactionRequestResponse(response.data);

    return transactionRequestResponse;
};
