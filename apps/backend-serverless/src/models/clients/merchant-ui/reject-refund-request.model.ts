import { InferType, object, string } from 'yup';
import { parseAndValidateStrict } from '../../../utilities/yup.utility.js';

export const rejectRefundRequestBodySchema = object().shape({
    refundId: string().required(),
    merchantReason: string().required(),
});

export type RejectRefundRequest = InferType<typeof rejectRefundRequestBodySchema>;

export const parseAndValidateRejectRefundRequest = (rejectRefundRequestBody: unknown): RejectRefundRequest => {
    return parseAndValidateStrict(
        rejectRefundRequestBody,
        rejectRefundRequestBodySchema,
        'Could not parse the reject refund request. Unknown Reason.'
    );
};
