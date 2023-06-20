import { PrismaClient } from '@prisma/client';
import { ShopifyMutationAppConfigure } from '../../models/sqs/shopify-mutation-retry.model.js';
import { MerchantService } from '../database/merchant-service.database.service.js';
import { makePaymentAppConfigure } from '../shopify/payment-app-configure.service.js';
import axios from 'axios';
import { validatePaymentAppConfigured } from '../shopify/validate-payment-app-configured.service.js';
import { MissingExpectedDatabaseRecordError } from '../../errors/missing-expected-database-record.error.js';

export const retryAppConfigure = async (
    appConfigureInfo: ShopifyMutationAppConfigure | null,
    prisma: PrismaClient,
    axiosInstance: typeof axios
) => {
    const merchantService = new MerchantService(prisma);

    if (appConfigureInfo == null) {
        throw new Error('App configure info is null.');
    }

    const merchant = await merchantService.getMerchant({ id: appConfigureInfo.merchantId });

    if (merchant == null) {
        throw new MissingExpectedDatabaseRecordError('merchant record: ' + appConfigureInfo.merchantId);
    }

    if (merchant.accessToken == null) {
        throw new MissingExpectedDatabaseRecordError('merchant access token');
    }

    const paymentAppConfigure = makePaymentAppConfigure(axiosInstance);

    try {
        const configureAppResponse = await paymentAppConfigure(
            merchant.id,
            appConfigureInfo.state,
            merchant.shop,
            merchant.accessToken
        );

        validatePaymentAppConfigured(configureAppResponse, merchant);

        await merchantService.updateMerchant(merchant, { active: appConfigureInfo.state });
    } catch (error) {
        // i should handle database and merchant update errors underneath this
        // can just throw error here
        throw error;
    }
};
