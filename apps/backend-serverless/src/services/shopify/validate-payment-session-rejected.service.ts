import * as Sentry from '@sentry/serverless';
import { ShopifyResponseError } from '../../errors/shopify-response.error';
import { RejectPaymentResponse } from '../../models/shopify-graphql-responses/reject-payment-response.model';
import {
    PaymentSessionNextActionAction,
    PaymentSessionStateCode,
    PaymentSessionStateRejected,
} from '../../models/shopify-graphql-responses/shared.model';

export const validatePaymentSessionRejected = (
    paymentSessionRejectResponse: RejectPaymentResponse
): { redirectUrl: string } => {
    const userErrors = paymentSessionRejectResponse.data.paymentSessionReject.userErrors;

    if (userErrors.length > 0) {
        const error = new ShopifyResponseError('user errors found.' + JSON.stringify(userErrors));
        console.log(error);
        Sentry.captureException(error);
        throw error;
    }

    const paymentSession = paymentSessionRejectResponse.data.paymentSessionReject.paymentSession;

    if (paymentSession == null) {
        const error = new ShopifyResponseError(
            'payment session is null. ' + JSON.stringify(paymentSessionRejectResponse.data)
        );
        console.log(error);
        Sentry.captureException(error);
        throw error;
    }

    const paymentSessionStateTestResolved = paymentSession.state as PaymentSessionStateRejected;
    const code = paymentSessionStateTestResolved.code;

    if (code != PaymentSessionStateCode.rejected) {
        const error = new ShopifyResponseError('payment session state is not rejected. ' + code);
        console.log(error);
        Sentry.captureException(error);
        throw error;
    }

    const paymentSessionNextAction = paymentSession.nextAction;

    if (paymentSessionNextAction == null) {
        const error = new ShopifyResponseError(
            'payment session next action is nukk. ' + JSON.stringify(paymentSession)
        );
        console.log(error);
        Sentry.captureException(error);
        throw error;
    }

    const action = paymentSessionNextAction.action;

    if (action != PaymentSessionNextActionAction.redirect) {
        const error = new ShopifyResponseError('payment session action is not redirect. ' + action);
        console.log(error);
        Sentry.captureException(error);
        throw error;
    }

    const redirectUrl = paymentSessionNextAction.context.redirectUrl;

    return { redirectUrl };
};
