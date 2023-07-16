import * as Sentry from '@sentry/serverless';
import { ShopifyResponseError } from '../../errors/shopify-response.error.js';
import { ResolvePaymentResponse } from '../../models/shopify-graphql-responses/resolve-payment-response.model.js';
import {
    PaymentSessionNextActionAction,
    PaymentSessionStateCode,
    PaymentSessionStateResolved,
} from '../../models/shopify-graphql-responses/shared.model.js';

export const validatePaymentSessionResolved = (
    paymentSessionResolveResponse: ResolvePaymentResponse,
): { redirectUrl: string } => {
    const userErrors = paymentSessionResolveResponse.data.paymentSessionResolve.userErrors;

    if (userErrors.length > 0) {
        const error = new ShopifyResponseError('User errors found.' + JSON.stringify(userErrors));
        console.log(error);
        Sentry.captureException(error);
        throw error;
    }

    const paymentSession = paymentSessionResolveResponse.data.paymentSessionResolve.paymentSession;

    if (paymentSession == null) {
        const error = new ShopifyResponseError(
            'Payment session is null. ' + JSON.stringify(paymentSessionResolveResponse.data),
        );
        console.log(error);
        Sentry.captureException(error);
        throw error;
    }

    const paymentSessionStateTestResolved = paymentSession.state as PaymentSessionStateResolved;
    const code = paymentSessionStateTestResolved.code;

    if (code != PaymentSessionStateCode.resolved) {
        const error = new ShopifyResponseError('Payment session state is not resolved. ' + code);
        console.log(error);
        Sentry.captureException(error);
        throw error;
    }

    const paymentSessionNextAction = paymentSession.nextAction;

    if (paymentSessionNextAction == null) {
        const error = new ShopifyResponseError(
            'Payment session next action is null. ' + JSON.stringify(paymentSession),
        );
        console.log(error);
        Sentry.captureException(error);
        throw error;
    }

    const action = paymentSessionNextAction.action;

    if (action != PaymentSessionNextActionAction.redirect) {
        const error = new ShopifyResponseError('Payment session action is not redirect. ' + action);
        console.log(error);
        Sentry.captureException(error);
        throw error;
    }

    const redirectUrl = paymentSessionNextAction.context.redirectUrl;

    return { redirectUrl };
};
