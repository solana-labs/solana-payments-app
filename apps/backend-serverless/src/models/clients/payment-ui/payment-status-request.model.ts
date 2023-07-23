import { InferType, object, string } from 'yup';
import { parseAndValidateStrict } from '../../../utilities/yup.utility';

export const paymentStatusRequestScheme = object().shape({
    paymentId: string().required(),
    language: string().required(),
});

export type PaymentStatusRequest = InferType<typeof paymentStatusRequestScheme>;

export const parseAndValidatePaymentStatusRequest = (paymentStatusRequestParameters: unknown): PaymentStatusRequest => {
    return parseAndValidateStrict(
        paymentStatusRequestParameters,
        paymentStatusRequestScheme,
        'Can not parse payment status request. Unkownn reason.'
    );
};
