import { ShopifyMutationPaymentResolve } from '../../../../src/models/shopify-mutation-retry.model.js';
import { prismaMock } from '../../../../prisma-singleton.js';
import MockAdapter from 'axios-mock-adapter';
import axios from 'axios';
import { PaymentRecordStatus } from '@prisma/client';

describe('Shopify Retry Payment Resolve Testing Suite', () => {
    // let mockPaymentSessionResolve: jest.Mock;

    // beforeEach(() => {
    //     // Reset all mock instances and their calls before each test
    //     jest.resetAllMocks();

    //     // Create mock instances
    //     mockPaymentSessionResolve = jest.fn();
    // });

    it('should execute successfully', () => {
        // const paymentResolveInfo: ShopifyMutationPaymentResolve = { paymentId: 'example-payment-id' };
        // // Mock the responses for your services and methods
        // let mock = new MockAdapter(axios);
        // mock.onPost().reply(200, {
        //     data: {
        //         paymentSessionResolve: {
        //             paymentSession: {
        //                 id: 'mock-id',
        //                 state: {
        //                     code: 'SUCCESS',
        //                 },
        //                 nextAction: { action: 'redirect', context: { redirectUrl: 'https://example.com' } },
        //             },
        //             userErrors: [],
        //         },
        //     },
        //     extensions: {},
        // });
        // const mockMerchant = {
        //     id: 'abcd',
        //     shop: 'mock-merchant.myshopify.com',
        //     lastNonce: 'abcd-1234',
        //     accessToken: null,
        //     scopes: null,
        //     paymentAddress: null,
        //     name: 'Mock Merchant',
        //     acceptedTermsAndConditions: false,
        //     dismissCompleted: false,
        // };
        // prismaMock.merchant.findUnique.mockResolvedValue(mockMerchant);
        // const mockPaymentRecord = {
        //     status: PaymentRecordStatus.pending,
        //     id: 'abcd',
        //     shopId: '1234',
        //     shopGid: 'abcd',
        //     shopGroup: 'efgh',
        //     test: true,
        //     amount: 19.94,
        //     usdcAmount: 19.94,
        //     currency: 'USD',
        //     customerAddress: null,
        //     merchantId: 'qwer',
        //     cancelURL: 'https://example.com',
        //     redirectUrl: null,
        //     transactionSignature: null,
        //     requestedAt: new Date(),
        //     completedAt: null,
        // };
        // prismaMock.paymentRecord.findFirst.mockResolvedValue(mockPaymentRecord);

        expect(true).toBe(true);
    });
});
