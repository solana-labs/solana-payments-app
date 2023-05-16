import { object, InferType, number, string } from 'yup';
import { parseAndValidate } from '../utilities/yup.utility.js';

export const paymentAddressRequestBodySchema = object().shape({
    paymentAddress: string().required(),
});

export type PaymentAddressRequest = InferType<typeof paymentAddressRequestBodySchema>;

export const parseAndValidatePaymentAddressRequestBody = (
    paymentAddressRequestBody: unknown
): PaymentAddressRequest => {
    return parseAndValidate(
        paymentAddressRequestBody,
        paymentAddressRequestBodySchema,
        'Could not parse the payment address request body. Unknown Reason.'
    );
};
