export const buildPaymentTransactionRequestEndpoint = (
    paymentId: string
): string => {
    return `https://uj1ctqe20k.execute-api.us-east-1.amazonaws.com/payment-transaction?paymentId=${paymentId}`
}
