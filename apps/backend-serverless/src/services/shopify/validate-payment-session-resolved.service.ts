import { ResolvePaymentResponse } from '../../models/shopify-graphql-responses/resolve-payment-response.model.js';
import {
    PaymentSessionNextActionAction,
    PaymentSessionStateCode,
    PaymentSessionStateResolved,
} from '../../models/shopify-graphql-responses/shared.model.js';

export const validatePaymentSessionResolved = (
    paymentSessionResolveResponse: ResolvePaymentResponse
): { redirectUrl: string } => {
    const userErrors = paymentSessionResolveResponse.data.paymentSessionResolve.userErrors;

    if (userErrors.length > 0) {
        // This is an issue because we shouldn't have user erros
        // TODO: Log the user errors
        // TODO: Throw because of user errors
        throw new Error('User errors were returned.');
    }

    const paymentSession = paymentSessionResolveResponse.data.paymentSessionResolve.paymentSession;

    if (paymentSession == null) {
        // This is an issue because we should be receiving this back, i think, get clarity from Shopify
        // TODO: Log this situation
        // TODO: Throw because of no payment session
        // TODO: Figure out if no payment session back is an issue
        throw new Error('Payment session is null.');
    }

    const paymentSessionStateTestResolved = paymentSession.state as PaymentSessionStateResolved;
    const code = paymentSessionStateTestResolved.code;

    if (code != PaymentSessionStateCode.resolved) {
        // This is an issue because we are trying to resolve the payment session
        // If it's not marked as resolved, then we haven't done what what wanted
        // TODO: Log this situation
        // TODO: Throw because of payment session not resolved
        throw new Error('Payment session did not resolve.');
    }

    const paymentSessionNextAction = paymentSession.nextAction;

    if (paymentSessionNextAction == null) {
        // This is an issue because we expect the payment session to have a next action
        // TODO: Log this situation
        // TODO: Throw because of no payment session next action
        throw new Error('Payment session next action is null.');
    }

    const action = paymentSessionNextAction.action;

    if (action != PaymentSessionNextActionAction.redirect) {
        // This is an issue because after we resolve, we expect to redirect
        // TODO: Log this situation
        // TODO: Throw because of payment session next action not redirect
        throw new Error('Payment session next action is not redirect.');
    }

    // Ok I think by here we have resolved, we have to decide if we want to return this redirect url or just
    // do everything in this handler
    const redirectUrl = paymentSessionNextAction.context.redirectUrl;

    return { redirectUrl };
};
