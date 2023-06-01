import { ResolvePaymentResponse } from '../../models/shopify-graphql-responses/resolve-payment-response.model.js';
import {
    PaymentSessionNextActionAction,
    PaymentSessionStateCode,
    PaymentSessionStateResolved,
} from '../../models/shopify-graphql-responses/shared.model.js';

export const validatePaymentSessionResolved = async (paymentSessionResolveResponse: ResolvePaymentResponse) => {
    /**
     *
     *  ok so what do we need to do here? so i will always have the context here that im trying to resolve a
     *  payment session. but the reality is there are multiple responses that could come back. for one, we could
     *  get some userErrors, that would be bad and it would mean we didn't resolve. another thing  that could happen
     *  is that the data we get back doesnt match the idea of resolving, like we could get a session back that has
     *  a state of rejected. the payment session object could also be null, that would be an issue. the state value could
     *  not be resolved, but i kinda already said that. next action could also be null and that would be an issue.
     *
     *  so with that here are the things i need to check
     *  1. are there user errrors
     *  2. is payment session null
     *  3. is the code resolved
     *  4. is the next action null
     *  5. is action set to redirect
     *  6. is redirect a valid url
     *
     */

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
};
