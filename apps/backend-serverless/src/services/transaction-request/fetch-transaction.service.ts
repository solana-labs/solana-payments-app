import axios from 'axios';
import {
    buildPaymentTransactionRequestEndpoint,
    buildTransactionRequestEndpoint,
} from '../../utilities/transaction-request/endpoints.utility.js';
import {
    TransactionRequestResponse,
    parseAndValidateTransactionRequestResponse,
} from '../../models/transaction-requests/transaction-request-response.model.js';
import { Merchant, PaymentRecord } from '@prisma/client';
import { USDC_MINT } from '../../configs/tokens.config.js';
import { ShopifyRecord } from '../database/record-service.database.service.js';

export const fetchRecordTransaction = async (
    record: ShopifyRecord,
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

    const sender = account;
    let receiver = merchant.paymentAddress;

    if (record.test) {
        receiver = account;
    }

    const endpoint = buildTransactionRequestEndpoint(
        receiver,
        sender,
        USDC_MINT.toBase58(),
        USDC_MINT.toBase58(),
        gas,
        record.usdcAmount.toFixed(6),
        'size',
        'blockhash',
        'true',
        singleUseNewAcc,
        singleUsePayer,
        'test-one,test-two'
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
