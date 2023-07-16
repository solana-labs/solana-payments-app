import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { prismaMock } from '../../../../prisma-singleton.js';
import { RefundSessionStateRejectedReason } from '../../../../src/models/shopify-graphql-responses/shared.model.js';
import { ShopifyMutationRefundReject } from '../../../../src/models/sqs/shopify-mutation-retry.model.js';
import { retryRefundReject } from '../../../../src/services/shopify-retry/retry-refund-reject.service.js';
import {
    createMockMerchant,
    createMockRefundRecord,
    createMockSuccessRefundSessionRejectResponse,
} from '../../../../src/utilities/testing-helper/create-mock.utility.js';

describe('Shopify Retry Refund Reject Testing Suite', () => {
    it('should execute successfully', async () => {
        // Mock refund session reject
        const mock = new MockAdapter(axios);
        const mockRefundSessionRejectResponse = createMockSuccessRefundSessionRejectResponse();
        mock.onPost().reply(200, mockRefundSessionRejectResponse);

        // Mock database calls
        const mockMerchant = createMockMerchant({ accessToken: 'example-access-token' });
        prismaMock.merchant.findUnique.mockResolvedValue(mockMerchant);
        const mockRefundRecord = createMockRefundRecord();
        prismaMock.refundRecord.findFirst.mockResolvedValue(mockRefundRecord);
        prismaMock.refundRecord.update.mockResolvedValue(mockRefundRecord);

        // Set up retry resolve info
        const refundResolveInfo: ShopifyMutationRefundReject = {
            refundId: 'example-payment-id',
            code: RefundSessionStateRejectedReason.processingError,
            merchantMessage: 'Customer didnt want it.',
        };

        // Test
        await expect(retryRefundReject(refundResolveInfo, prismaMock, axios)).resolves.not.toThrow();
    });
});
