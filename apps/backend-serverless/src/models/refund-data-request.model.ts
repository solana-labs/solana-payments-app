import { object, InferType, number } from 'yup';
import { parseAndValidate } from '../utilities/yup.utility.js';
import { DEFAULT_PAGINATION_SIZE } from '../utilities/database-services.utility.js';

export const refundDataRequestParametersSchema = object().shape({
    pageNumber: number().min(1).default(1),
    pageSize: number().min(1).default(DEFAULT_PAGINATION_SIZE),
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
