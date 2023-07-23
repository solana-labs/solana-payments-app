import { InferType, number, object, string } from 'yup';
import { RefundStatusOption } from '../../../utilities/clients/merchant-ui/create-refund-response.utility';
import { DEFAULT_PAGINATION_SIZE } from '../../../utilities/clients/merchant-ui/database-services.utility';
import { parseAndValidateStrict } from '../../../utilities/yup.utility';

const parseParameters = params => {
    return {
        pageNumber: parseInt(params.pageNumber),
        pageSize: parseInt(params.pageSize),
        refundStatus: params.refundStatus,
    };
};

export const refundDataRequestParametersSchema = object().shape({
    pageNumber: number().min(1).default(1),
    pageSize: number().min(1).default(DEFAULT_PAGINATION_SIZE),
    refundStatus: string().oneOf(Object.values(RefundStatusOption)).default(RefundStatusOption.open),
});

export type RefundDataRequestParameters = InferType<typeof refundDataRequestParametersSchema>;

export const parseAndValidateRefundDataRequestParameters = (
    refundDataRequestParmatersBody: unknown
): RefundDataRequestParameters => {
    return parseAndValidateStrict(
        parseParameters(refundDataRequestParmatersBody),
        refundDataRequestParametersSchema,
        'Could not parse the refund data request parameters. Unknown Reason.'
    );
};
