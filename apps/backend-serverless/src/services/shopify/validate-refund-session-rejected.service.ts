import * as Sentry from '@sentry/serverless';
import { ShopifyResponseError } from '../../errors/shopify-response.error.js';
import { RejectRefundResponse } from '../../models/shopify-graphql-responses/reject-refund-response.model.js';
import {
    RefundSessionStateCode,
    RefundSessionStateRejected,
} from '../../models/shopify-graphql-responses/shared.model.js';

export const validateRefundSessionRejected = (refundSessionRejectResponse: RejectRefundResponse) => {
    const userErrors = refundSessionRejectResponse.data.refundSessionReject.userErrors;

    if (userErrors.length > 0) {
        const error = new ShopifyResponseError('User errors found.' + JSON.stringify(userErrors));
        console.log(error);
        Sentry.captureException(error);
        throw error;
    }

    const refundSession = refundSessionRejectResponse.data.refundSessionReject.refundSession;

    if (refundSession == null) {
        const error = new ShopifyResponseError(
            'Refund session is null. ' + JSON.stringify(refundSessionRejectResponse.data),
        );
        console.log(error);
        Sentry.captureException(error);
        throw error;
    }

    const refundSessionStateTestResolved = refundSession.state as RefundSessionStateRejected;

    if (refundSessionStateTestResolved.code != RefundSessionStateCode.rejected) {
        const error = new ShopifyResponseError(
            'Refund session state is not rejected. ' + refundSessionStateTestResolved.code,
        );
        console.log(error);
        Sentry.captureException(error);
        throw error;
    }
};
