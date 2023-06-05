import { object, InferType } from 'yup';
import { parseAndValidate } from '../../utilities/yup.utility.js';
import { sharedRefundResponseRootSchema, shopifyResponseExtensionsSchema } from './shared.model.js';

export const dataRefundSessionRejectSchema = object().shape({
    refundSessionReject: sharedRefundResponseRootSchema.required(),
});

export const refundSessionRejectResponseSchema = object().shape({
    data: dataRefundSessionRejectSchema.required(),
    extensions: shopifyResponseExtensionsSchema.required(),
});

export type RejectRefundResponse = InferType<typeof refundSessionRejectResponseSchema>;

export const parseAndValidateRejectRefundResponse = (rejectRefundResponeBody: unknown): RejectRefundResponse => {
    return parseAndValidate<RejectRefundResponse>(
        rejectRefundResponeBody,
        refundSessionRejectResponseSchema,
        'Could not parse the reject refund response body. Unknown Reason.'
    );
};
