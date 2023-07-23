import { InferType, number, object } from 'yup';
import { DEFAULT_PAGINATION_SIZE } from '../../../utilities/clients/merchant-ui/database-services.utility';
import { parseAndValidateStrict } from '../../../utilities/yup.utility';

const parseParameters = (params: any) => {
    return {
        pageNumber: parseInt(params.pageNumber),
        pageSize: parseInt(params.pageSize),
    };
};

export const paymentDataRequestParametersSchema = object().shape({
    pageNumber: number().min(1).default(-1),
    pageSize: number().min(1).default(DEFAULT_PAGINATION_SIZE),
});

export type PaymentDataRequestParameters = InferType<typeof paymentDataRequestParametersSchema>;

export const parseAndValidatePaymentDataRequestParameters = (
    paymentDataRequestParametersBody: any
): PaymentDataRequestParameters => {
    return parseAndValidateStrict(
        parseParameters(paymentDataRequestParametersBody),
        paymentDataRequestParametersSchema,
        'Could not parse the payment data request parameters. Unknown Reason.'
    );
};
