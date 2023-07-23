import { Merchant, PaymentRecord } from '@prisma/client';
import axios from 'axios';
import { USDC_MINT } from '../../configs/tokens.config';
import {
    TransactionRequestResponse,
    parseAndValidateTransactionRequestResponse,
} from '../../models/transaction-requests/transaction-request-response.model';
import { buildPayTransactionRequestEndpoint } from '../../utilities/transaction-request/endpoints.utility';

export const fetchPaymentTransaction = async (
    paymentRecord: PaymentRecord,
    merchant: Merchant,
    account: string,
    gas: string,
    singleUseNewAcc: string,
    singleUsePayer: string,
    payWithPoints: boolean,
    axiosInstance: typeof axios
): Promise<TransactionRequestResponse> => {
    if (merchant.walletAddress == null && merchant.tokenAddress == null) {
        throw new Error('Merchant payment address not found.');
    }

    let receiverWalletAddress = merchant.walletAddress;
    let receiverTokenAddress = merchant.tokenAddress;

    const endpoint = buildPayTransactionRequestEndpoint(
        receiverWalletAddress,
        receiverTokenAddress,
        account,
        USDC_MINT.toBase58(),
        USDC_MINT.toBase58(),
        gas,
        paymentRecord.usdcAmount.toFixed(6),
        'size',
        'blockhash',
        'true',
        singleUseNewAcc,
        singleUsePayer,
        'test-one,test-two', // TODO: Update these with real values
        merchant.loyaltyProgram,
        merchant.pointsMint,
        merchant.pointsBack ? merchant.pointsBack.toString() : null,
        payWithPoints.toString()
    );
    const headers = {
        'Content-Type': 'application/json',
    };

    const response = await axiosInstance.post(endpoint, { headers: headers });

    if (response.status != 200) {
        throw new Error('Error fetching payment transaction.');
    }

    const paymentTransactionResponse = parseAndValidateTransactionRequestResponse(response.data);

    return paymentTransactionResponse;
};
