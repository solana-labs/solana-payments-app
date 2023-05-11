import { object, string, InferType, array } from 'yup';
import { parseAndValidate } from '../../utilities/yup.utility.js';
import { sharedRefundResponseRootSchema, shopifyResponseExtensionsSchema } from './shared.model.js';

export const resolveRefundResponseDataSchema = object().shape({
    refundSessionResolve: sharedRefundResponseRootSchema.required(),
});

export const resolveRefundResponseSchema = object().shape({
    data: resolveRefundResponseDataSchema.required(),
    extensions: shopifyResponseExtensionsSchema.required(),
});

export type ResolveRefundResponse = InferType<typeof resolveRefundResponseSchema>;

export const parseAndValidateResolveRefundResponse = (resolveRefundResponeBody: any): ResolveRefundResponse => {
    return parseAndValidate<ResolveRefundResponse>(
        resolveRefundResponeBody,
        resolveRefundResponseSchema,
        'Could not parse the resolve refund response body. Unknown Reason.'
    );
};
