export const API_BASE_URL = 'https://jtj4gkf73i.execute-api.us-east-1.amazonaws.com';

export const API_ENDPOINTS = {
    install: `${API_BASE_URL}/install`,
    redirect: `${API_BASE_URL}/redirect`,
    payment: `${API_BASE_URL}/payment`,
    refund: `${API_BASE_URL}/refund`,
    screenWallet: `${API_BASE_URL}/screen-wallet`,
    helius: `${API_BASE_URL}/helius`,
    paymentTransaction: `${API_BASE_URL}/payment-transaction`,
    refundTransaction: `${API_BASE_URL}/refund-transaction`,
    rejectRefund: `${API_BASE_URL}/reject-refund`,
    getPaymentTransaction: `${API_BASE_URL}/payment-transaction`,
    paymentStatus: `${API_BASE_URL}/payment-status`,
    merchantData: `${API_BASE_URL}/merchantData`,
    refundData: `${API_BASE_URL}/refundData`,
    paymentData: `${API_BASE_URL}/paymentData`,
    login: `${API_BASE_URL}/login`,
    paymentAddress: `${API_BASE_URL}/payment-address`,
};
