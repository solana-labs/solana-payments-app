import { KybState, Merchant, PrismaClient } from '@prisma/client';
import * as Sentry from '@sentry/serverless';
import axios from 'axios';
import { MerchantService } from '../database/merchant-service.database.service.js';
import { makePaymentAppConfigure } from '../shopify/payment-app-configure.service.js';
import { validatePaymentAppConfigured } from '../shopify/validate-payment-app-configured.service.js';
import { sendAppConfigureRetryMessage } from '../sqs/sqs-send-message.service.js';

export const contingentlyHandleAppConfigure = async (
    merchant: Merchant,
    axiosInstance: typeof axios,
    prisma: PrismaClient
): Promise<Merchant> => {
    const merchantService = new MerchantService(prisma);

    const paymentAppConfigure = makePaymentAppConfigure(axiosInstance);

    const addedWallet = merchant.walletAddress != null || merchant.tokenAddress != null;
    const acceptedTermsAndConditions = merchant.acceptedTermsAndConditions;
    const kybIsFinished = merchant.kybState === KybState.finished;

    const canBeActive = addedWallet && acceptedTermsAndConditions && kybIsFinished;

    if (merchant.accessToken != null && canBeActive) {
        try {
            const appConfigureResponse = await paymentAppConfigure(
                merchant.id.slice(0, 10),
                true,
                merchant.shop,
                merchant.accessToken
            );

            validatePaymentAppConfigured(appConfigureResponse, merchant);

            merchant = await merchantService.updateMerchant(merchant, { active: canBeActive });
        } catch (error) {
            try {
                await sendAppConfigureRetryMessage(merchant.id, canBeActive);
            } catch (error) {
                Sentry.captureException(error);
                // CRITICAL: Add to critical database
            }
        }
    }

    return merchant;
};
