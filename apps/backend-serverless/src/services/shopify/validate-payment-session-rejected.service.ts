import { RejectPaymentResponse } from '../../models/shopify-graphql-responses/reject-payment-response.model.js';
import {
    PaymentSessionNextActionAction,
    PaymentSessionStateCode,
    PaymentSessionStateRejected,
} from '../../models/shopify-graphql-responses/shared.model.js';

export const validatePaymentSessionRejected = async (paymentSessionRejectResponse: RejectPaymentResponse) => {
    /**
     *
     * ok so we're looking to do something similar to what we do for payment session resolved
     * what do we need to check here? well again, the first thing to look at is user errors. if there are user errors
     * then we had a problem with our request. the next thing to check is if the payment session is null. if it is null
     * we have another problem. the next thing to check is if the state is rejected. if it is not rejected, then we have
     * another problem, i also think when we reject, we will get a redirect url, so we need to check for that as well as
     * the null values along the way.
     *
     * so with that here are the things i need to check
     *  1. are there user errrors
     *  2. is payment session null
     *  3. is the code rejected
     *  4. is the next action null
     *  5. is action set to redirect
     *  6. is redirect a valid url
     *  7. is the reason set to what we expected it to be
     *
     */

    const userErrors = paymentSessionRejectResponse.data.paymentSessionReject.userErrors;

    if (userErrors.length > 0) {
        // This is an issue because we shouldn't have user erros
        // TODO: Log the user errors
        // TODO: Throw because of user errors
        throw new Error('User errors were returned.');
    }

    const paymentSession = paymentSessionRejectResponse.data.paymentSessionReject.paymentSession;

    if (paymentSession == null) {
        // This is an issue because we should be receiving this back, i think, get clarity from Shopify
        // TODO: Log this situation
        // TODO: Throw because of no payment session
        // TODO: Figure out if no payment session back is an issue
        throw new Error('Payment session is null.');
    }

    const paymentSessionStateTestResolved = paymentSession.state as PaymentSessionStateRejected;
    const code = paymentSessionStateTestResolved.code;

    if (code != PaymentSessionStateCode.rejected) {
        // This is an issue because we are trying to reject the payment session
        // If it's not marked as rejected, then we haven't done what what wanted
        // TODO: Log this situation
        // TODO: Throw because of payment session not resolved
        throw new Error('Payment session did not reject.');
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

    // TODO: Validate paymentSessionStateTestResolved is actually the type we expect and it has the other reject values
};
