import { object, string, InferType } from 'yup';
import { parseAndValidate } from '../../../utilities/yup.utility.js';

export const paymentStatusRequestScheme = object().shape({
    paymentId: string().required(),
    language: string().required(),
});

export type PaymentStatusRequest = InferType<typeof paymentStatusRequestScheme>;

export const parseAndValidatePaymentStatusRequest = (paymentStatusRequestParameters: unknown): PaymentStatusRequest => {
    return parseAndValidate(
        paymentStatusRequestParameters,
        paymentStatusRequestScheme,
        'Can not parse payment status request. Unkownn reason.'
    );
};
