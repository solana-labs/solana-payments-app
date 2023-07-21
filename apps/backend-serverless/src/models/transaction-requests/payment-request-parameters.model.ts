import { InferType, boolean, object, string } from 'yup';
import { parseAndValidateStrict } from '../../utilities/yup.utility.js';

export const paymentRequestParametersScheme = object().shape({
    paymentId: string().required(),
    payWithPoints: boolean().default(false).required(),
});

export type PaymentRequestParameters = InferType<typeof paymentRequestParametersScheme>;

export const parseAndValidatePaymentRequest = (paymentStatusRequestParameters: unknown): PaymentRequestParameters => {
    return parseAndValidateStrict(
        paymentStatusRequestParameters,
        paymentRequestParametersScheme,
        'Can not parse payment transaction request parameters. Unkownn reason.'
    );
};
