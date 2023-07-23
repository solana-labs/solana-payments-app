import { InferType, object, string } from 'yup';
import { parseAndValidateStrict } from '../../../utilities/yup.utility';

export const refundStatusRequestScheme = object().shape({
    shopId: string().required(),
});

export type RefundStatusRequest = InferType<typeof refundStatusRequestScheme>;

export const parseAndValidateRefundStatusRequest = (refundStatusRequestParameters: unknown): RefundStatusRequest => {
    return parseAndValidateStrict<RefundStatusRequest>(
        refundStatusRequestParameters,
        refundStatusRequestScheme,
        'Could not parse the refund status request parameters. Unknown Reason.'
    );
};
