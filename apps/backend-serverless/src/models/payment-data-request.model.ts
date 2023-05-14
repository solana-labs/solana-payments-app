import { object, InferType, number } from 'yup';
import { parseAndValidate } from '../utilities/yup.utility.js';

export const paymentDataRequestParametersSchema = object().shape({
    pageNumber: number().required(),
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
