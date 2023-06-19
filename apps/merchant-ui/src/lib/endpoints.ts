export const API_ENDPOINTS = {
    refundTransaction: `${process.env.NEXT_PUBLIC_API_BASE_URL}/refund-transaction`,
    rejectRefund: `${process.env.NEXT_PUBLIC_API_BASE_URL}/reject-refund`,
    merchantData: `${process.env.NEXT_PUBLIC_API_BASE_URL}/merchant-data`,
    refundData: `${process.env.NEXT_PUBLIC_API_BASE_URL}/refund-data`,
    refundStatus: `${process.env.NEXT_PUBLIC_API_BASE_URL}/refund-status`,
    paymentData: `${process.env.NEXT_PUBLIC_API_BASE_URL}/payment-data`,
    updateMerchant: `${process.env.NEXT_PUBLIC_API_BASE_URL}/update-merchant`,
};
