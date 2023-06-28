import { InferType, number, object } from 'yup';
import { DEFAULT_PAGINATION_SIZE } from '../../../utilities/clients/merchant-ui/database-services.utility.js';
import { parseAndValidateStrict } from '../../../utilities/yup.utility.js';

export const paymentDataRequestParametersSchema = object().shape({
    pageNumber: number().min(1).default(1),
    pageSize: number().min(1).default(DEFAULT_PAGINATION_SIZE),
});

export type PaymentDataRequestParameters = InferType<typeof paymentDataRequestParametersSchema>;

export const parseAndValidatePaymentDataRequestParameters = (
    paymentDataRequestParmatersBody: unknown
): PaymentDataRequestParameters => {
    return parseAndValidateStrict(
        paymentDataRequestParmatersBody,
        paymentDataRequestParametersSchema,
        'Could not parse the payment data request parameters. Unknown Reason.'
    );
};
