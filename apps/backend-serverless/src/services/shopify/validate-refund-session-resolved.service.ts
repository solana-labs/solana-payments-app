import { ShopifyResponseError } from '../../errors/shopify-response.error.js';
import { ResolveRefundResponse } from '../../models/shopify-graphql-responses/resolve-refund-response.model.js';
import {
    RefundSessionStateCode,
    RefundSessionStateResolved,
} from '../../models/shopify-graphql-responses/shared.model.js';
import * as Sentry from '@sentry/serverless';

export const validateRefundSessionResolved = (refundSessionResolveResponse: ResolveRefundResponse) => {
    const userErrors = refundSessionResolveResponse.data.refundSessionResolve.userErrors;

    if (userErrors.length > 0) {
        const error = new ShopifyResponseError('User errors found.' + JSON.stringify(userErrors));
        console.log(error);
        Sentry.captureException(error);
        throw error;
    }

    const refundSession = refundSessionResolveResponse.data.refundSessionResolve.refundSession;

    if (refundSession == null) {
        const error = new ShopifyResponseError(
            'Refund session is null. ' + JSON.stringify(refundSessionResolveResponse.data)
        );
        console.log(error);
        Sentry.captureException(error);
        throw error;
    }

    const refundSessionStateTestResolved = refundSession.state as RefundSessionStateResolved;

    if (refundSessionStateTestResolved.code != RefundSessionStateCode.resolved) {
        const error = new ShopifyResponseError(
            'Refund session state is not resolved. ' + refundSessionStateTestResolved.code
        );
        console.log(error);
        Sentry.captureException(error);
        throw error;
    }
};
