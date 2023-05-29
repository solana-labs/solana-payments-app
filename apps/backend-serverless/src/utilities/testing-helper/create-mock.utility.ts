import { Merchant, PaymentRecord, PaymentRecordStatus } from '@prisma/client';
import { ResolvePaymentResponse } from '../../models/shopify-graphql-responses/resolve-payment-response.model.js';

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
