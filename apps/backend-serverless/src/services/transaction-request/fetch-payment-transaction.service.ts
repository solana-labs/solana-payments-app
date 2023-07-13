import { Merchant, PaymentRecord } from '@prisma/client';
import axios from 'axios';
import { USDC_MINT } from '../../configs/tokens.config.js';
import {
    TransactionRequestResponse,
    parseAndValidateTransactionRequestResponse,
} from '../../models/transaction-requests/transaction-request-response.model.js';
import { buildTransactionRequestEndpoint } from '../../utilities/transaction-request/endpoints.utility.js';

export const fetchPaymentTransaction = async (
    paymentRecord: PaymentRecord,
    merchant: Merchant,
    account: string,
    gas: string,
    singleUseNewAcc: string,
    singleUsePayer: string,
    axiosInstance: typeof axios
): Promise<TransactionRequestResponse> => {
    if (merchant.walletAddress == null && merchant.tokenAddress == null) {
        throw new Error('Merchant payment address not found.');
    }

    const sender = account;
    let receiverWalletAddress = merchant.walletAddress;
    let receiverTokenAddress = merchant.tokenAddress;

    if (paymentRecord.test) {
        receiverWalletAddress = account;
        receiverTokenAddress = null;
    }

    const endpoint = buildTransactionRequestEndpoint(
        receiverWalletAddress,
        receiverTokenAddress,
        sender,
        USDC_MINT.toBase58(),
        USDC_MINT.toBase58(),
        gas,
        paymentRecord.usdcAmount.toFixed(6),
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
        throw new Error('Error fetching payment transaction.');
    }

    const paymentTransactionResponse = parseAndValidateTransactionRequestResponse(response.data);

    return paymentTransactionResponse;
};
