import { object, InferType, string } from 'yup';

export const paymentTransactionRequestScheme = object().shape({
    paymentId: string().required(),
});

export type PaymentTransactionRequest = InferType<typeof paymentTransactionRequestScheme>;

export const parseAndValidatePaymentTransactionRequest = (
    paymentTransactionRequestParams: any
): PaymentTransactionRequest => {
    let parsedPaymentRequest: PaymentTransactionRequest;
    try {
        parsedPaymentRequest = paymentTransactionRequestScheme.cast(
            paymentTransactionRequestParams
        ) as PaymentTransactionRequest;
    } catch (error) {
        if (error instanceof Error) {
            throw error;
        } else {
            throw new Error('Could not parse the payment status request. Unknown Reason.');
        }
    }
    return parsedPaymentRequest;
};
