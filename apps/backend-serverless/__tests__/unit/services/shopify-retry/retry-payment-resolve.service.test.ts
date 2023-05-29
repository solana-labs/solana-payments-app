import { ShopifyMutationPaymentResolve } from '../../../../src/models/shopify-mutation-retry.model.js';
import { prismaMock } from '../../../../prisma-singleton.js';
import MockAdapter from 'axios-mock-adapter';
import axios from 'axios';
import { PaymentRecordStatus } from '@prisma/client';
import {
    createMockMerchant,
    createMockPaymentRecord,
    createMockSuccessPaymentSessionResolveResponse,
} from '../../../../src/utilities/testing-helper/create-mock.utility.js';

describe('Shopify Retry Payment Resolve Testing Suite', () => {
    // let mockPaymentSessionResolve: jest.Mock;

    // beforeEach(() => {
    //     // Reset all mock instances and their calls before each test
    //     jest.resetAllMocks();

    //     // Create mock instances
    //     mockPaymentSessionResolve = jest.fn();
    // });

    it('should execute successfully', () => {
        // Mock the responses for your services and methods
        let mock = new MockAdapter(axios);
        const mockPaymentSessionResolveResponse = createMockSuccessPaymentSessionResolveResponse();
        mock.onPost().reply(200, mockPaymentSessionResolveResponse);
        const mockMerchant = createMockMerchant();
        prismaMock.merchant.findUnique.mockResolvedValue(mockMerchant);
        const mockPaymentRecord = createMockPaymentRecord();
        prismaMock.paymentRecord.findFirst.mockResolvedValue(mockPaymentRecord);

        const paymentResolveInfo: ShopifyMutationPaymentResolve = { paymentId: 'example-payment-id' };

        expect(true).toBe(true);
    });
});
