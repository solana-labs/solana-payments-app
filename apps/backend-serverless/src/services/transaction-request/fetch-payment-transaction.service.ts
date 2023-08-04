import { Merchant, PaymentRecord } from '@prisma/client';
import axios from 'axios';
import { USDC_MINT } from '../../configs/tokens.config.js';
import {
    TransactionRequestResponse,
    parseAndValidateTransactionRequestResponse,
} from '../../models/transaction-requests/transaction-request-response.model.js';
import { CustomerResponse } from '../../utilities/clients/create-customer-response.js';
import { buildPayTransactionRequestEndpoint } from '../../utilities/transaction-request/endpoints.utility.js';

export const fetchPaymentTransaction = async (
    paymentRecord: PaymentRecord,
    merchant: Merchant,
    account: string,
    gas: string,
    singleUseNewAcc: string,
    singleUsePayer: string,
    payWithPoints: boolean,
    customerResponse: CustomerResponse
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
        'test-one,test-two' // TODO: Update these with real values
    );

    const headers = {
        'Content-Type': 'application/json',
    };

    const body = {
        loyaltyProgram: merchant.loyaltyProgram,
        payWithPoints: payWithPoints,
        points: {
            mint: merchant.pointsMint,
            back: merchant.pointsBack,
        },
        tiers: {
            currentTier: customerResponse.tier ? customerResponse.tier.mint : undefined,
            currentDiscount: customerResponse.tier ? customerResponse.tier.discount : undefined,
            customerOwns: customerResponse.tier ? customerResponse.customerOwns : undefined,
            nextTier: customerResponse.nextTier ? customerResponse.nextTier.mint : undefined,
            isFirstTier: customerResponse.isFirstTier ? customerResponse.isFirstTier : undefined,
        },
    };

    const response = await axios.post(endpoint, body, { headers: headers });

    if (response.status != 200) {
        throw new Error('Error fetching payment transaction.');
    }

    const paymentTransactionResponse = parseAndValidateTransactionRequestResponse(response.data);

    return paymentTransactionResponse;
};
