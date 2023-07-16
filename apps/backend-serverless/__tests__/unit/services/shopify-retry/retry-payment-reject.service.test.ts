import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { prismaMock } from '../../../../prisma-singleton.js';
import { PaymentSessionStateRejectedReason } from '../../../../src/models/shopify-graphql-responses/shared.model.js';
import { ShopifyMutationPaymentReject } from '../../../../src/models/sqs/shopify-mutation-retry.model.js';
import { retryPaymentReject } from '../../../../src/services/shopify-retry/retry-payment-reject.service.js';
import {
    createMockMerchant,
    createMockPaymentRecord,
    createMockSuccessPaymentSessionRejectResponse,
} from '../../../../src/utilities/testing-helper/create-mock.utility.js';

describe('Shopify Retry Payment Reject Testing Suite', () => {
    it('should execute successfully', async () => {
        // Mock payment session reject
        const mock = new MockAdapter(axios);
        const mockPaymentSessionRejectResponse = createMockSuccessPaymentSessionRejectResponse();
        mock.onPost().reply(200, mockPaymentSessionRejectResponse);

        // Mock database calls
        const mockMerchant = createMockMerchant({ accessToken: 'example-access-token' });
        prismaMock.merchant.findUnique.mockResolvedValue(mockMerchant);
        const mockPaymentRecord = createMockPaymentRecord();
        prismaMock.paymentRecord.findFirst.mockResolvedValue(mockPaymentRecord);
        prismaMock.paymentRecord.update.mockResolvedValue(mockPaymentRecord);

        // Set up retry reject info
        const paymentRejectInfo: ShopifyMutationPaymentReject = {
            paymentId: 'example-payment-id',
            reason: PaymentSessionStateRejectedReason.processingError,
        };

        // Test
        await expect(retryPaymentReject(paymentRejectInfo, prismaMock, axios)).resolves.not.toThrow();
    });
});
