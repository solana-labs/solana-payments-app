import { ShopifyMutationAppConfigure } from '../../../../src/models/sqs/shopify-mutation-retry.model.js';
import { prismaMock } from '../../../../prisma-singleton.js';
import MockAdapter from 'axios-mock-adapter';
import axios from 'axios';
import {
    createMockMerchant,
    createMockPaymentAppConfigureResponse,
    createMockPaymentRecord,
} from '../../../../src/utilities/testing-helper/create-mock.utility.js';
import { retryAppConfigure } from '../../../../src/services/shopify-retry/retry-app-configure.service.js';

describe('Shopify Retry App Configure Testing Suite', () => {
    it('should execute successfully', async () => {
        // Mock payment app configure
        const mock = new MockAdapter(axios);
        const mockPaymentAppConfigureResponse = createMockPaymentAppConfigureResponse();
        mock.onPost().reply(200, mockPaymentAppConfigureResponse);

        // Mock database calls
        const mockMerchant = createMockMerchant({ accessToken: 'example-access-token' });
        prismaMock.merchant.findUnique.mockResolvedValue(mockMerchant);
        const mockPaymentRecord = createMockPaymentRecord();
        prismaMock.paymentRecord.findFirst.mockResolvedValue(mockPaymentRecord);
        prismaMock.paymentRecord.update.mockResolvedValue(mockPaymentRecord);

        // Set up retry reject info
        const appConfigureInfo: ShopifyMutationAppConfigure = {
            merchantId: 'example-merchant-id',
            state: true,
        };

        // Test
        await expect(retryAppConfigure(appConfigureInfo, prismaMock, axios)).resolves.not.toThrow();
    });
});
