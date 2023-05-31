import axios from 'axios';
import { buildRefundTransactionRequestEndpoint } from '../../utilities/endpoints.utility.js';
import { PaymentRecord, RefundRecord } from '@prisma/client';
import {
    TransactionRequestResponse,
    parseAndValidateTransactionRequestResponse,
} from '../../models/transaction-request-response.model.js';
import { fetchTransaction } from '../fetch-transaction.service.js';
import { findPayingWalletFromTransaction } from '../../utilities/transaction-inspection.utility.js';
import { USDC_MINT } from '../../configs/tokens.config.js';

export const fetchRefundTransaction = async (
    refundRecord: RefundRecord,
    associatedPaymentRecord: PaymentRecord,
    account: string,
    gas: string,
    singleUseNewAcc: string,
    singleUsePayer: string
): Promise<TransactionRequestResponse> => {
    var refundAmount = refundRecord.usdcAmount.toPrecision(4).toString();

    // TODO: Clean this up, this is messy, then document how you can test with it
    // Allow for testing values
    if (
        refundRecord.test == true &&
        process.env.TEST_USDC_SIZE != null &&
        isNaN(parseFloat(process.env.TEST_USDC_SIZE || '')) == false
    ) {
        refundAmount = process.env.TEST_USDC_SIZE;
    }

    const paymentTransaction = associatedPaymentRecord.transactionSignature;

    // We can't refund a payment that doesn't exist
    if (associatedPaymentRecord.transactionSignature == null) {
        throw new Error('Payment transaction not found.');
    }

    // Now we have the transaction that the orginal payment was made in
    const transaction = await fetchTransaction(associatedPaymentRecord.transactionSignature);

    const payingCustomerWalletAddress = await findPayingWalletFromTransaction(transaction);

    const endpoint = buildRefundTransactionRequestEndpoint(
        payingCustomerWalletAddress.toBase58(), // this needs to be the customer
        account, // this needs to be passed in from the request but the payment will be the merchant
        USDC_MINT.toBase58(),
        USDC_MINT.toBase58(),
        gas,
        refundAmount,
        'size',
        'blockhash',
        'true',
        singleUseNewAcc,
        singleUsePayer,
        'test-one,test-two' // TODO: Update these with real values
    );
    const headers = {
        'Content-Type': 'application/x-www-form-urlencoded', // TODO: I think i need to make this json
    };

    const response = await axios.post(endpoint, { account: account }, { headers: headers });

    if (response.status != 200) {
        throw new Error('Error fetching refund transaction.');
    }

    let transactionRequestResponse: TransactionRequestResponse;

    try {
        transactionRequestResponse = parseAndValidateTransactionRequestResponse(response.data); // TODO: Can prob clean up or remove the try/catch here
    } catch (error) {
        if (error instanceof Error) {
            throw error;
        } else {
            throw new Error('Could not parse transaction response. Unknown Reason.');
        }
    }

    return transactionRequestResponse;
};
