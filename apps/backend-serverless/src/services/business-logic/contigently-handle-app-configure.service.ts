import { KybState, Merchant, PrismaClient } from '@prisma/client';
import { makePaymentAppConfigure } from '../shopify/payment-app-configure.service.js';
import axios from 'axios';
import { validatePaymentAppConfigured } from '../shopify/validate-payment-app-configured.service.js';
import { MerchantService } from '../database/merchant-service.database.service.js';
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

    if (merchant.accessToken != null) {
        try {
            const appConfigureResponse = await paymentAppConfigure(
                merchant.id,
                canBeActive,
                merchant.shop,
                merchant.accessToken
            );

            validatePaymentAppConfigured(appConfigureResponse);

            merchant = await merchantService.updateMerchant(merchant, { active: canBeActive });
        } catch (error) {
            try {
                await sendAppConfigureRetryMessage(merchant.id, canBeActive);
            } catch (error) {
                // If this fails we should log a critical error but it's not the end of the world, it just means that we have an issue sending retry messages
                // We should eventually have some kind of redundant system here but for now we can just send the user back to the merchant ui
                // in a state that is logged in but not fully set up with Shopify
                // TODO: Handle this better
                // TODO: Log critical error
            }
        }
    }

    return merchant;
};
