import { Merchant, PaymentRecord, PaymentRecordStatus, RefundRecord } from '@prisma/client';
import { ResolvePaymentResponse } from '../../models/shopify-graphql-responses/resolve-payment-response.model.js';
import { RejectPaymentResponse } from '../../models/shopify-graphql-responses/reject-payment-response.model.js';
import { ResolveRefundResponse } from '../../models/shopify-graphql-responses/resolve-refund-response.model.js';
import { RejectRefundResponse } from '../../models/shopify-graphql-responses/reject-refund-response.model.js';
import { PaymentAppConfigureResponse } from '../../models/shopify-graphql-responses/payment-app-configure-response.model.js';

/**
 *
 * @param merchantData: Partial<Merchant>
 * @returns a mock merchant to be used for testing only
 */
export const createMockMerchant = (merchantData: Partial<Merchant> = {}): Merchant => {
    return {
        id: merchantData.id ?? 'some-merchant-id',
        shop: merchantData.shop ?? 'some-merchant-shop.myshopify.com',
        lastNonce: merchantData.lastNonce ?? 'some-nonce',
        accessToken: merchantData.accessToken ?? null,
        scopes: merchantData.scopes ?? null,
        paymentAddress: merchantData.paymentAddress ?? null,
        name: merchantData.name ?? 'Some Merchant',
        acceptedTermsAndConditions: merchantData.acceptedTermsAndConditions ?? false,
        dismissCompleted: merchantData.dismissCompleted ?? false,
    };
};

/**
 *
 * @param paymentRecordData: Partial<PaymentRecord>
 * @returns a mock merchant to be used for testing only
 */
export const createMockPaymentRecord = (paymentRecordData: Partial<PaymentRecord> = {}): PaymentRecord => {
    return {
        id: paymentRecordData.id ?? 'some-payment-record-id',
        status: paymentRecordData.status ?? PaymentRecordStatus.pending,
        shopGid: paymentRecordData.shopGid ?? 'some-shop-gid',
        shopId: paymentRecordData.shopId ?? 'some-shop-id',
        shopGroup: paymentRecordData.shopGroup ?? 'some-shop-group',
        test: paymentRecordData.test ?? true,
        amount: paymentRecordData.amount ?? 19.94,
        usdcAmount: paymentRecordData.usdcAmount ?? 19.94,
        currency: paymentRecordData.currency ?? 'USD',
        cancelURL: paymentRecordData.cancelURL ?? 'https://example.com',
        merchantId: paymentRecordData.merchantId ?? 'some-merchant-id',
        transactionSignature: paymentRecordData.transactionSignature ?? null,
        redirectUrl: paymentRecordData.redirectUrl ?? null,
        requestedAt: paymentRecordData.requestedAt ?? new Date(),
        completedAt: paymentRecordData.completedAt ?? null,
    };
};

/**
 *
 * @param refundRecordData: Partial<RefundRecord>
 * @returns a mock refund record to be used for testing only
 */
export const createMockRefundRecord = (refundRecordData: Partial<RefundRecord> = {}): RefundRecord => {
    return {
        id: refundRecordData.id ?? 'some-refund-record-id',
        status: refundRecordData.status ?? PaymentRecordStatus.pending,
        shopGid: refundRecordData.shopGid ?? 'some-shop-gid',
        shopId: refundRecordData.shopId ?? 'some-shop-id',
        shopPaymentId: refundRecordData.shopPaymentId ?? 'some-shop-payment-id',
        test: refundRecordData.test ?? true,
        amount: refundRecordData.amount ?? 19.94,
        usdcAmount: refundRecordData.usdcAmount ?? 19.94,
        currency: refundRecordData.currency ?? 'USD',
        transactionSignature: refundRecordData.transactionSignature ?? null,
        requestedAt: refundRecordData.requestedAt ?? new Date(),
        completedAt: refundRecordData.completedAt ?? null,
        merchantId: refundRecordData.merchantId ?? 'some-merchant-id',
    };
};

/**
 *
 * @param paymentSessionResolveResponse: Partial<ResolvePaymentResponse>
 * @returns a mock payment session resolve response to be used for testing only
 */
export const createMockSuccessPaymentSessionResolveResponse = (
    paymentSessionResolveResponse: Partial<ResolvePaymentResponse> = {}
): ResolvePaymentResponse => {
    return {
        data: {
            paymentSessionResolve: {
                paymentSession: {
                    id: 'some-mock-payment-session-id',
                    state: {
                        code: 'SUCCESS',
                    },
                    nextAction: { action: 'redirect', context: { redirectUrl: 'https://example.com' } },
                },
                userErrors: [],
            },
        },
        extensions: {},
    };
};

/**
 *
 * @param paymentSessionRejectResponse: Partial<ResolvePaymentResponse>
 * @returns a mock payment session resolve response to be used for testing only
 */
export const createMockSuccessPaymentSessionRejectResponse = (
    paymentSessionRejectResponse: Partial<RejectPaymentResponse> = {}
): RejectPaymentResponse => {
    return {
        data: {
            paymentSessionReject: {
                paymentSession: {
                    id: 'some-mock-payment-session-id',
                    state: {
                        code: 'SUCCESS',
                    },
                    nextAction: { action: 'redirect', context: { redirectUrl: 'https://example.com' } },
                },
                userErrors: [],
            },
        },
        extensions: {},
    };
};

/**
 *
 * @param refundSessionRejectResponse: Partial<ResolveRefundResponse>
 * @returns a mock refund session resolve response to be used for testing only
 */
export const createMockSuccessRefundSessionResolveResponse = (
    refundSessionResolveResponse: Partial<ResolveRefundResponse> = {}
): ResolveRefundResponse => {
    return {
        data: {
            refundSessionResolve: {
                refundSession: {
                    id: 'some-mock-refund-session-id',
                    state: {
                        code: 'SUCCESS',
                    },
                },
                userErrors: [],
            },
        },
        extensions: {},
    };
};

/**
 *
 * @param refundSessionRejectResponse: Partial<RejectRefundResponse>
 * @returns a mock refund session reject response to be used for testing only
 */
export const createMockSuccessRefundSessionRejectResponse = (
    refundSessionRejectResponse: Partial<RejectRefundResponse> = {}
): RejectRefundResponse => {
    return {
        data: {
            refundSessionReject: {
                refundSession: {
                    id: 'some-mock-refund-session-id',
                    state: {
                        code: 'SUCCESS',
                    },
                },
                userErrors: [],
            },
        },
        extensions: {},
    };
};

/**
 *
 * @param paymentAppConfigureResponse: Partial<PaymentAppConfigureResponse>
 * @returns a mock payment app configure response to be used for testing only
 */
export const createMockPaymentAppConfigureResponse = (
    paymentAppConfigureResponse: Partial<PaymentAppConfigureResponse> = {}
): PaymentAppConfigureResponse => {
    return {
        data: {
            paymentsAppConfigure: {
                paymentsAppConfiguration: {
                    externalHandle: 'mock-external-id',
                    ready: true,
                },
                userErrors: [],
            },
        },
        extensions: {},
    };
};
