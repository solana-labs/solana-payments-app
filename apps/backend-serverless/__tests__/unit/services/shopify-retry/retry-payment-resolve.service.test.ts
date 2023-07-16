import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { prismaMock } from '../../../../prisma-singleton.js';
import { ShopifyMutationPaymentResolve } from '../../../../src/models/sqs/shopify-mutation-retry.model.js';
import { retryPaymentResolve } from '../../../../src/services/shopify-retry/retry-payment-resolve.service.js';
import {
    createMockMerchant,
    createMockPaymentRecord,
    createMockSuccessPaymentSessionResolveResponse,
} from '../../../../src/utilities/testing-helper/create-mock.utility.js';

describe('Shopify Retry Payment Resolve Testing Suite', () => {
    it('should execute successfully', async () => {
        // Mock payment session resolve
        const mock = new MockAdapter(axios);
        const mockPaymentSessionResolveResponse = createMockSuccessPaymentSessionResolveResponse();
        mock.onPost().reply(200, mockPaymentSessionResolveResponse);

        // Mock database calls
        const mockMerchant = createMockMerchant({ accessToken: 'example-access-token' });
        prismaMock.merchant.findUnique.mockResolvedValue(mockMerchant);
        const mockPaymentRecord = createMockPaymentRecord();
        prismaMock.paymentRecord.findFirst.mockResolvedValue(mockPaymentRecord);
        prismaMock.paymentRecord.update.mockResolvedValue(mockPaymentRecord);

        // Set up retry resolve info
        const paymentResolveInfo: ShopifyMutationPaymentResolve = { paymentId: 'example-payment-id' };

        // Test
        await expect(retryPaymentResolve(paymentResolveInfo, prismaMock, axios)).resolves.not.toThrow();
    });
});
