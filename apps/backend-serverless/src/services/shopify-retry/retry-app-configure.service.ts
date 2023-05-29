import { PrismaClient } from '@prisma/client';
import { ShopifyMutationAppConfigure } from '../../models/shopify-mutation-retry.model.js';
import { MerchantService } from '../database/merchant-service.database.service.js';
import { makePaymentAppConfigure } from '../shopify/payment-app-configure.service.js';
import axios from 'axios';

export const retryAppConfigure = async (appConfigureInfo: ShopifyMutationAppConfigure | null, prisma: PrismaClient) => {
    const merchantService = new MerchantService(prisma);

    if (appConfigureInfo == null) {
        throw new Error('App configure info is null.');
    }

    const merchant = await merchantService.getMerchant({ id: appConfigureInfo.merchantId });

    if (merchant == null) {
        throw new Error('Could not find merchant.');
    }

    if (merchant.accessToken == null) {
        throw new Error('Could not find access token.');
    }

    const paymentAppConfigure = makePaymentAppConfigure(axios);

    try {
        const configureAppResponse = await paymentAppConfigure(
            merchant.id,
            appConfigureInfo.state,
            merchant.shop,
            merchant.accessToken
        );

        // Validate the response

        // TODO: Update the merchant record to reflect that we configured the app
    } catch (error) {
        // Throw an error specifically about the database, might be able to handle this differently
        throw new Error('Could not update merchant record.');
    }
};
