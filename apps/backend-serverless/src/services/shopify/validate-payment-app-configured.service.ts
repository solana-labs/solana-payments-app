import { PaymentAppConfigureResponse } from '../../models/shopify-graphql-responses/payment-app-configure-response.model.js';

export const validatePaymentAppConfigured = async (paymentAppConfiguredResponse: PaymentAppConfigureResponse) => {
    /**
     * 1. are there user errors
     * 2. is payment app configured null
     * 3. is the external handle what we expected if its there
     */

    const userErrors = paymentAppConfiguredResponse.data.paymentsAppConfigure.userErrors;

    if (userErrors.length > 0) {
        // This is an issue because we shouldn't have user erros
        // TODO: Log the user errors
        // TODO: Throw because of user errors
        throw new Error('User errors were returned.');
    }

    const paymentAppConfigured = paymentAppConfiguredResponse.data.paymentsAppConfigure.paymentsAppConfiguration;

    if (paymentAppConfigured == null) {
        // This is an issue because we should be receiving this back, i think, get clarity from Shopify
        // TODO: Log this situation
        // TODO: Throw because of no payment app configuration
        // TODO: Figure out if no payment app configureation back is an issue
        throw new Error('Payment app configuration is null.');
    }

    const externalHandle = paymentAppConfigured.externalHandle;
    // TODO: Check external handle
};
