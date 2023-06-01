import { object, string, InferType, array } from 'yup';
import { parseAndValidate } from '../../utilities/yup.utility.js';
import { sharedRefundResponseRootSchema, shopifyResponseExtensionsSchema } from './shared.model.js';

export const dataRefundSessionResolveSchema = object().shape({
    refundSessionResolve: sharedRefundResponseRootSchema.required(),
});

export const refundSessionResolveResponseSchema = object().shape({
    data: dataRefundSessionResolveSchema.required(),
    extensions: shopifyResponseExtensionsSchema.required(),
});

export type ResolveRefundResponse = InferType<typeof refundSessionResolveResponseSchema>;

export const parseAndValidateResolveRefundResponse = (resolveRefundResponeBody: any): ResolveRefundResponse => {
    return parseAndValidate<ResolveRefundResponse>(
        resolveRefundResponeBody,
        refundSessionResolveResponseSchema,
        'Could not parse the resolve refund response body. Unknown Reason.'
    );
};
