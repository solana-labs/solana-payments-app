import { object, string, InferType, boolean, number } from 'yup';

export const paymentStatusRequestScheme = object().shape({
    id: string().required(),
});

export type PaymentStatusRequest = InferType<typeof paymentStatusRequestScheme>;

export const paymentStatusResponseScheme = object().shape({
    merchantDisplayName: string().required(),
    totalAmountFiatDisplay: string().required(),
    totalAmountUSDCDisplay: string().required(),
    cancelUrl: string().required(),
    completed: boolean().required(),
    redirectUrl: string().optional(),
});

export type PaymentStatusResponse = InferType<typeof paymentStatusResponseScheme>;

export const parseAndValidatePaymentStatusRequest = (paymentInitiationRequestBody: any): PaymentStatusRequest => {
    let parsedPaymentRequest: PaymentStatusRequest;
    try {
        parsedPaymentRequest = paymentStatusRequestScheme.cast(paymentInitiationRequestBody) as PaymentStatusRequest;
    } catch (error) {
        if (error instanceof Error) {
            throw error;
        } else {
            throw new Error('Could not parse the payment status request. Unknown Reason.');
        }
    }
    return parsedPaymentRequest;
};
