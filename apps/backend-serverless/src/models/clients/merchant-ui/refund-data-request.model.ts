import { object, InferType, number, string } from 'yup';
import { parseAndValidate } from '../../../utilities/yup.utility.js';
import { DEFAULT_PAGINATION_SIZE } from '../../../utilities/clients/merchant-ui/database-services.utility.js';
import { RefundRecordStatus } from '@prisma/client';
import { RefundStatusOption } from '../../../utilities/clients/merchant-ui/create-refund-response.utility.js';

export const refundDataRequestParametersSchema = object().shape({
    pageNumber: number().min(1).default(1),
    pageSize: number().min(1).default(DEFAULT_PAGINATION_SIZE),
    refundStatus: string().oneOf(Object.values(RefundStatusOption)).default(RefundStatusOption.open),
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
