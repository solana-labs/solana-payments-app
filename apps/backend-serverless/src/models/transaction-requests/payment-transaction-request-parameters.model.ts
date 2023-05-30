import { object, InferType, string } from 'yup';
import { parseAndValidate } from '../../utilities/yup.utility.js';

export const paymentTransactionRequestParametersScheme = object().shape({
    paymentId: string().required(),
});

export type PaymentTransactionRequestParameters = InferType<typeof paymentTransactionRequestParametersScheme>;

export const parseAndValidatePaymentTransactionRequest = (
    paymentStatusRequestParameters: any
): PaymentTransactionRequestParameters => {
    return parseAndValidate(
        paymentStatusRequestParameters,
        paymentTransactionRequestParametersScheme,
        'Can not parse payment transaction request parameters. Unkownn reason.'
    );
};
