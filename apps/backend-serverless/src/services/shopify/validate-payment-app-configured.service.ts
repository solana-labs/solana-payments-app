import { Merchant } from '@prisma/client';
import * as Sentry from '@sentry/serverless';
import { ShopifyResponseError } from '../../errors/shopify-response.error.js';
import { PaymentAppConfigureResponse } from '../../models/shopify-graphql-responses/payment-app-configure-response.model.js';

export const validatePaymentAppConfigured = (
    paymentAppConfiguredResponse: PaymentAppConfigureResponse,
    merchant: Merchant
) => {
    const userErrors = paymentAppConfiguredResponse.data.paymentsAppConfigure.userErrors;

    if (userErrors.length > 0) {
        console.log(userErrors);
        const error = new ShopifyResponseError('user errors found.' + JSON.stringify(userErrors));
        Sentry.captureException(error);
        throw error;
    }

    const paymentAppConfigured = paymentAppConfiguredResponse.data.paymentsAppConfigure.paymentsAppConfiguration;

    if (paymentAppConfigured == null) {
        const error = new ShopifyResponseError('payment app configuration is null.');
        console.log(error);
        Sentry.captureException(error);
        throw error;
    }

    const externalHandle = paymentAppConfigured.externalHandle;

    if (externalHandle == null || externalHandle !== merchant.id.slice(0, 10)) {
        const error = new ShopifyResponseError(
            'merchant id does not match external handle. external handler: ' +
                externalHandle +
                ' merchant id: ' +
                merchant.id
        );
        console.log(error);
        Sentry.captureException(error);
        throw error;
    }
};
