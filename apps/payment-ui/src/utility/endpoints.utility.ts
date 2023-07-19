export const buildTransactionRequestEndpoint = (paymentId: string, payWithPoints: boolean = false): string => {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

    if (backendUrl == null) {
        throw new Error('Missing NEXT_PUBLIC_BACKEND_URL');
    }

    return `${backendUrl}/payment-transaction?paymentId=${paymentId}&payWithPoints=${payWithPoints.toString()}`;
};
