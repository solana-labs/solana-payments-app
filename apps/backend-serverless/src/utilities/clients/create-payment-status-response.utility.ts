import { Merchant, PaymentRecord, PaymentRecordRejectionReason, PaymentRecordStatus } from '@prisma/client';
import { paymentSessionRejectionDisplayMessages } from '../../services/shopify/payment-session-reject.service.js';

export interface PaymentStatusResponse {
    merchantDisplayName: string;
    totalAmountFiatDisplay: string;
    usdcSize: number;
    cancelUrl: string;
    redirectUrl: string | null;
    completed: boolean;
}

export interface PaymentErrorResponse {
    errorTitle: string;
    errorDetail: string;
    errorRedirect: string;
}

export const createPaymentStatusResponse = (
    paymentRecord: PaymentRecord,
    merchant: Merchant,
    language: string
): PaymentStatusResponse => {
    const merchantDisplayName = merchant.name ?? merchant.shop.split('.')[0];
    const totalAmountFiatDisplay = paymentRecord.amount.toLocaleString(language, {
        style: 'currency',
        currency: paymentRecord.currency,
    });
    const usdcSize = paymentRecord.usdcAmount;
    const cancelUrl = paymentRecord.cancelURL;
    const redirectUrl = paymentRecord.redirectUrl;
    const completed = paymentRecord.redirectUrl ? true : false;

    return {
        merchantDisplayName,
        totalAmountFiatDisplay,
        usdcSize,
        cancelUrl,
        redirectUrl,
        completed,
    };
};

export const createPaymentErrorResponse = (paymentRecord: PaymentRecord): PaymentErrorResponse | null => {
    if (paymentRecord.status != PaymentRecordStatus.rejected) {
        return null;
    }

    const rejectionReason = paymentRecord.rejectionReason ?? PaymentRecordRejectionReason.unknownReason;
    const rejectionReasonDisplayMesages = paymentSessionRejectionDisplayMessages(rejectionReason);

    return {
        errorTitle: rejectionReasonDisplayMesages.errorTitle,
        errorDetail: rejectionReasonDisplayMesages.errorDescription,
        errorRedirect: paymentRecord.redirectUrl ?? paymentRecord.cancelURL, // TODO: Use reason data to populate this, ALSO we should probably use the redirect url here but cancel is kinda ok i guess
    };
};
