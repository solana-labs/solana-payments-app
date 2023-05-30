import { object, string, InferType } from 'yup';
import { parseAndValidate } from '../../../utilities/yup.utility.js';

export const refundStatusRequestScheme = object().shape({
    shopId: string().required(),
});

export type RefundStatusRequest = InferType<typeof refundStatusRequestScheme>;

export const parseAndValidateRefundStatusRequest = (refundStatusRequestParameters: unknown): RefundStatusRequest => {
    return parseAndValidate<RefundStatusRequest>(
        refundStatusRequestParameters,
        refundStatusRequestScheme,
        'Could not parse the refund status request parameters. Unknown Reason.'
    );
};
