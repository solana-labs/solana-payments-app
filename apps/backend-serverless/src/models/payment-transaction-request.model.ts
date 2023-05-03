import { object, string, InferType, boolean, number } from 'yup'

export const paymentTransactionRequestScheme = object().shape({
    receiver: string().required(),
    sendingToken: string().required(),
    receivingToken: string().required(),
    feePayer: string().required(),
    receivingAmount: string().required(),
    amountType: string().required(),
    transactionType: string().required(),
    createAta: string().required(),
})

export type PaymentTransactionRequest = InferType<
    typeof paymentTransactionRequestScheme
>

export const parseAndValidatePaymentTransactionRequest = (
    paymentTransactionRequestParams: any
): PaymentTransactionRequest => {
    let parsedPaymentRequest: PaymentTransactionRequest
    try {
        parsedPaymentRequest = paymentTransactionRequestScheme.cast(
            paymentTransactionRequestParams
        ) as PaymentTransactionRequest
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
