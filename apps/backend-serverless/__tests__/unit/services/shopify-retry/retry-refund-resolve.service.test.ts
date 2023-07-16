import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { prismaMock } from '../../../../prisma-singleton.js';
import { RefundSessionStateRejectedReason } from '../../../../src/models/shopify-graphql-responses/shared.model.js';
import { ShopifyMutationRefundReject } from '../../../../src/models/sqs/shopify-mutation-retry.model.js';
import { retryRefundResolve } from '../../../../src/services/shopify-retry/retry-refund-resolve.service.js';
import {
    createMockMerchant,
    createMockRefundRecord,
    createMockSuccessRefundSessionResolveResponse,
} from '../../../../src/utilities/testing-helper/create-mock.utility.js';

describe('Shopify Retry Refund Resolve Testing Suite', () => {
    it('should execute successfully', async () => {
        // Mock refund session resolve
        let mock = new MockAdapter(axios);
        const mockRefundSessionResolveResponse = createMockSuccessRefundSessionResolveResponse();
        mock.onPost().reply(200, mockRefundSessionResolveResponse);

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
        await expect(retryRefundResolve(refundResolveInfo, prismaMock, axios)).resolves.not.toThrow();
    });
});
