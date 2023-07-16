import { prismaMock } from '../../../../prisma-singleton.js';
import { MerchantService } from '../../../../src/services/database/merchant-service.database.service.js';
import { createMockMerchant } from '../../../../src/utilities/testing-helper/create-mock.utility.js';
describe('Merchant Testing Suite', () => {
    let merchantService: MerchantService;

    beforeEach(() => {
        merchantService = new MerchantService(prismaMock);
    });

    it('find a merchant with shop', async () => {
        const mockMerchant = createMockMerchant({ shop: 'test-shop.myshopify.com' });
        prismaMock.merchant.findUnique.mockResolvedValue(mockMerchant);

        const merchant = await merchantService.getMerchant({
            shop: 'test-shop.myshopify.com',
        });

        expect(merchant).toEqual(mockMerchant);
    });

    it('find a merchant with id', async () => {
        const mockMerchant = createMockMerchant({ id: 'abcd' });

        prismaMock.merchant.findUnique.mockResolvedValue(mockMerchant);

        const merchant = await merchantService.getMerchant({ id: 'abcd' });

        expect(merchant).toEqual(mockMerchant);
    });

    it('create a merchant', async () => {
        const mockMerchant = createMockMerchant({
            id: 'abcd',
            shop: 'mock-merchant-create.myshopify.com',
            lastNonce: 'abcd-1234',
        });

        prismaMock.merchant.create.mockResolvedValue(mockMerchant);

        const merchant = await merchantService.createMerchant(
            'abcd',
            'mock-merchant-create.myshopify.com',
            'abcd-1234',
        );

        expect(merchant).toEqual(mockMerchant);
    });

    it('find no merchants', async () => {
        const mockMerchant = createMockMerchant({ shop: 'mock-merchant-create.myshopify.com' });

        const merchant = await merchantService.getMerchant({
            shop: 'mock-merchant-create.myshopify.com',
        });

        expect(merchant).not.toEqual(mockMerchant);
    });

    it('update a merchant', async () => {
        const mockMerchantBeforeUpdate = createMockMerchant({ lastNonce: 'abcd-1234' });
        const mockMerchantAfterUpdate = createMockMerchant({ lastNonce: 'efgh-5678' });

        prismaMock.merchant.update.mockResolvedValue(mockMerchantAfterUpdate);

        const merchant = await merchantService.updateMerchant(mockMerchantBeforeUpdate, { lastNonce: 'efgh-5678' });

        expect(merchant).toEqual(mockMerchantAfterUpdate);
    });

    it('update a merchant failing', async () => {
        const mockMerchantThatDoesNotExist = createMockMerchant();

        prismaMock.merchant.update.mockRejectedValue(new Error('Failed to update merchant'));

        await expect(
            merchantService.updateMerchant(mockMerchantThatDoesNotExist, {
                lastNonce: 'efgh-5678',
            }),
        ).rejects.toThrow();
    });
});
