export const buildPaymentTransactionRequestEndpoint = (paymentId: string): string => {
    return `https://boubt4ej71.execute-api.us-east-1.amazonaws.com/payment-transaction?paymentId=${paymentId}`;
};
