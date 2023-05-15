import { object, InferType, number } from 'yup';
import { parseAndValidate } from '../utilities/yup.utility.js';
import { DEFAULT_PAGINATION_SIZE } from '../utilities/database-services.utility.js';

export const paymentDataRequestParametersSchema = object().shape({
    pageNumber: number().min(1).default(1),
    pageSize: number().min(1).default(DEFAULT_PAGINATION_SIZE),
});

export type PaymentDataRequestParameters = InferType<typeof paymentDataRequestParametersSchema>;

export const parseAndValidatePaymentDataRequestParameters = (
    paymentDataRequestParmatersBody: unknown
): PaymentDataRequestParameters => {
    return parseAndValidate(
        paymentDataRequestParmatersBody,
        paymentDataRequestParametersSchema,
        'Could not parse the payment data request parameters. Unknown Reason.'
    );
};
