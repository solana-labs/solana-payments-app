import { InferType, object } from 'yup';
import { parseAndValidateStrict } from '../../utilities/yup.utility';
import { sharedRefundResponseRootSchema, shopifyResponseExtensionsSchema } from './shared.model';

export const dataRefundSessionRejectSchema = object().shape({
    refundSessionReject: sharedRefundResponseRootSchema.required(),
});

export const refundSessionRejectResponseSchema = object().shape({
    data: dataRefundSessionRejectSchema.required(),
    extensions: shopifyResponseExtensionsSchema.required(),
});

export type RejectRefundResponse = InferType<typeof refundSessionRejectResponseSchema>;

export const parseAndValidateRejectRefundResponse = (rejectRefundResponeBody: unknown): RejectRefundResponse => {
    return parseAndValidateStrict<RejectRefundResponse>(
        rejectRefundResponeBody,
        refundSessionRejectResponseSchema,
        'Could not parse the reject refund response body. Unknown Reason.'
    );
};
