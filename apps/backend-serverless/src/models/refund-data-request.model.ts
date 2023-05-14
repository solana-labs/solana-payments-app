import { object, InferType, number } from 'yup';
import { parseAndValidate } from '../utilities/yup.utility.js';

export const refundDataRequestParametersSchema = object().shape({
    pageNumber: number().required(),
});

export type RefundDataRequestParameters = InferType<typeof refundDataRequestParametersSchema>;

export const parseAndValidateRefundDataRequestParameters = (
    refundDataRequestParmatersBody: unknown
): RefundDataRequestParameters => {
    return parseAndValidate(
        refundDataRequestParmatersBody,
        refundDataRequestParametersSchema,
        'Could not parse the refund data request parameters. Unknown Reason.'
    );
};
