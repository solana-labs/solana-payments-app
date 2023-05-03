import { object, string, InferType, boolean, number } from 'yup'

export const paymentTransactionResponseScheme = object().shape({
    transaction: string().required(),
    message: string().optional(),
})

export type PaymentTransactionResponse = InferType<
    typeof paymentTransactionResponseScheme
>

export const parseAndValidatePaymentTransactionResponse = (
    paymentTransactionResponseBody: any
): PaymentTransactionResponse => {
    let parsedPaymentRequest: PaymentTransactionResponse
    try {
        parsedPaymentRequest = paymentTransactionResponseScheme.cast(
            paymentTransactionResponseBody
        ) as PaymentTransactionResponse
    } catch (error) {
        if (error instanceof Error) {
            throw error
        } else {
            throw new Error(
                'Could not parse the payment status request. Unknown Reason.'
            )
        }
    }
    return parsedPaymentRequest
}
