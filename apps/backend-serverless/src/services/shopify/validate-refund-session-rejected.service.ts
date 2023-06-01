import { RejectRefundResponse } from '../../models/shopify-graphql-responses/reject-refund-response.model.js';
import {
    RefundSessionStateCode,
    RefundSessionStateRejected,
} from '../../models/shopify-graphql-responses/shared.model.js';

export const validateRefundSessionRejected = (refundSessionRejectResponse: RejectRefundResponse) => {
    const userErrors = refundSessionRejectResponse.data.refundSessionReject.userErrors;

    if (userErrors.length > 0) {
        // This is an issue because we shouldn't have user erros
        // TODO: Log this situation
        // TODO: Throw because of no refund session
        // TODO: Figure out if no refund session back is an issue
        throw new Error('Refund session is null.');
    }

    const refundSession = refundSessionRejectResponse.data.refundSessionReject.refundSession;

    if (refundSession == null) {
        // This is an issue because we should be receiving this back, i think, get clarity from Shopify
        // TODO: Log this situation
        // TODO: Throw because of no refund session
        // TODO: Figure out if no refund session back is an issue
        throw new Error('Refund session is null.');
    }

    const refundSessionStateTestResolved = refundSession.state as RefundSessionStateRejected;

    if (refundSessionStateTestResolved.code != RefundSessionStateCode.rejected) {
        // This is an issue because we are trying to resolve the refund session
        // If it's not marked as resolved, then we haven't done what what wanted
        // TODO: Log this situation
        // TODO: Throw because of payment session not resolved
        throw new Error('Refund session did not reject.');
    }
};
