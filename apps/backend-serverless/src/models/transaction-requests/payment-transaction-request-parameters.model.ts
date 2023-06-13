import { InferType, object, string } from 'yup';
import { parseAndValidateStrict } from '../../utilities/yup.utility.js';

export const paymentTransactionRequestParametersScheme = object().shape({
    id: string().required(),
});

export type PaymentTransactionRequestParameters = InferType<typeof paymentTransactionRequestParametersScheme>;

export const parseAndValidatePaymentTransactionRequest = (
    paymentStatusRequestParameters: unknown
): PaymentTransactionRequestParameters => {
    return parseAndValidateStrict(
        paymentStatusRequestParameters,
        paymentTransactionRequestParametersScheme,
        'Can not parse payment transaction request parameters. Unkownn reason.'
    );
};
