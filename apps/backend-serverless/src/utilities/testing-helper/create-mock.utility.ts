import { Merchant, PaymentRecord, PaymentRecordStatus, RefundRecord } from '@prisma/client';
import { ResolvePaymentResponse } from '../../models/shopify-graphql-responses/resolve-payment-response.model.js';
import { RejectPaymentResponse } from '../../models/shopify-graphql-responses/reject-payment-response.model.js';
import { ResolveRefundResponse } from '../../models/shopify-graphql-responses/resolve-refund-response.model.js';
import { RejectRefundResponse } from '../../models/shopify-graphql-responses/reject-refund-response.model.js';
import { PaymentAppConfigureResponse } from '../../models/shopify-graphql-responses/payment-app-configure-response.model.js';
import { TransactionRequestResponse } from '../../models/transaction-requests/transaction-request-response.model.js';
import { web3 } from '@project-serum/anchor';
import { findAssociatedTokenAddress } from '../pubkeys.utility.js';
import { USDC_MINT } from '../../configs/tokens.config.js';
import { TOKEN_PROGRAM_ID, createTransferCheckedInstruction } from '@solana/spl-token';
import { AdminDataResponse } from '../../models/shopify-graphql-responses/admin-data.response.model.js';
import {
    PaymentSessionNextActionAction,
    PaymentSessionStateCode,
    PaymentSessionStateRejectedReason,
    RefundSessionStateCode,
    RefundSessionStateRejectedReason,
} from '../../models/shopify-graphql-responses/shared.model.js';

/**
 *
 * @param merchantData: Partial<Merchant>
 * @returns a mock merchant to be used for testing only
 */
export const createMockMerchant = (merchantData: Partial<Merchant> = {}): Merchant => {
    return {
        id: merchantData.id ?? 'some-merchant-id',
        email: merchantData.email ?? 'some-merchant-email',
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
                        code: PaymentSessionStateCode.resolved,
                    },
                    nextAction: {
                        action: PaymentSessionNextActionAction.redirect,
                        context: {
                            redirectUrl: 'https://example.com',
                        },
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
                        code: PaymentSessionStateCode.rejected,
                        reason: PaymentSessionStateRejectedReason.risky,
                    },
                    nextAction: {
                        action: PaymentSessionNextActionAction.redirect,
                        context: { redirectUrl: 'https://example.com' },
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
                        code: RefundSessionStateCode.resolved,
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
                        code: RefundSessionStateCode.rejected,
                        reason: RefundSessionStateRejectedReason.processingError,
                        merchantMessage: 'some lil reason thing',
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

/**
 *
 * @param paymentAppConfigureResponse: Partial<PaymentAppConfigureResponse>
 * @returns a mock payment app configure response to be used for testing only
 */
export const createMockAdminDataResponse = (adminDataResponse: Partial<AdminDataResponse> = {}): AdminDataResponse => {
    return {
        data: {
            shop: {
                name: 'mock-shop-name',
                email: 'mock-shop-email',
                enabledPresentmentCurrencies: ['mock-currency-1', 'mock-currency-2'],
            },
        },
        extensions: {},
    };
};

/**
 *
 * @param transactionResponseResponse: Partial<TransactionRequestResponse>
 * @returns a mock transaction request response to be used for testing
 */
export const createMockTransactionRequestResponse = async (
    transactionResponseResponse: Partial<{
        payer: web3.PublicKey;
        receiver: web3.PublicKey;
        feePayer: web3.PublicKey;
    }> = {}
): Promise<TransactionRequestResponse> => {
    // const mockTransaction = await createMockTransaction(transactionResponseResponse);

    // const transactionBuffer = mockTransaction.serialize({
    //     verifySignatures: false,
    //     requireAllSignatures: false,
    // });
    // const transactionString = transactionBuffer.toString('base64');

    return {
        transaction: 'transaction',
        message: 'mock message',
    };
};

/**
 *
 * @param transactionResponseResponse: Partial<TransactionRequestResponse>
 * @returns a mock transaction request response to be used for testing
 */
export const createMockTransaction = async (
    mockTransactionInputs: Partial<{
        payer: web3.PublicKey | null;
        receiver: web3.PublicKey | null;
        feePayer: web3.PublicKey | null;
    }> = {}
): Promise<web3.Transaction> => {
    // Set up the transaction
    const payerPubkey = mockTransactionInputs.payer ?? web3.Keypair.generate().publicKey;
    const payerAta = await findAssociatedTokenAddress(payerPubkey, USDC_MINT);
    const receiverPubkey = mockTransactionInputs.receiver ?? web3.Keypair.generate().publicKey;
    const receiverAta = await findAssociatedTokenAddress(receiverPubkey, USDC_MINT);
    const transferQuantity = 10 * 10 ** 6;
    const transferCheckedInstruction = createTransferCheckedInstruction(
        payerAta,
        USDC_MINT,
        receiverAta,
        payerPubkey,
        transferQuantity,
        6,
        [],
        TOKEN_PROGRAM_ID
    );
    const mockTransaction = new web3.Transaction().add(transferCheckedInstruction).add(transferCheckedInstruction);
    return mockTransaction;
};
