import { InferType, number, object, string } from 'yup';
import { RefundStatusOption } from '../../../utilities/clients/merchant-ui/create-refund-response.utility.js';
import { DEFAULT_PAGINATION_SIZE } from '../../../utilities/clients/merchant-ui/database-services.utility.js';
import { parseAndValidateStrict } from '../../../utilities/yup.utility.js';

export const refundDataRequestParametersSchema = object().shape({
    pageNumber: number()
        .min(1)
        .default(1)
        .transform((value, originalValue) => {
            return isNaN(originalValue) ? undefined : value;
        }),
    pageSize: number()
        .min(1)
        .default(DEFAULT_PAGINATION_SIZE)
        .transform((value, originalValue) => {
            return isNaN(originalValue) ? undefined : value;
        }),
    refundStatus: string().oneOf(Object.values(RefundStatusOption)).default(RefundStatusOption.open),
});

export type RefundDataRequestParameters = InferType<typeof refundDataRequestParametersSchema>;

export const parseAndValidateRefundDataRequestParameters = (
    refundDataRequestParmatersBody: unknown
): RefundDataRequestParameters => {
    return parseAndValidateStrict(
        refundDataRequestParmatersBody,
        refundDataRequestParametersSchema,
        'Could not parse the refund data request parameters. Unknown Reason.'
    );
};
