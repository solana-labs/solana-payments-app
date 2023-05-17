import { MerchantService } from '../../../src/services/database/merchant-service.database.service.js';
import { prismaMock } from '../../../prisma-singleton.js';

describe('Merchant Testing Suite', () => {
    let merchantService: MerchantService;

    beforeEach(() => {
        merchantService = new MerchantService(prismaMock);
    });

    it('find a merchant with shop', async () => {
        const mockMerchant = {
            id: 'abcd',
            shop: 'mock-merchant.myshopify.com',
            lastNonce: 'abcd-1234',
            accessToken: null,
            scopes: null,
            paymentAddress: null,
            name: 'Mock Merchant',
            acceptedTermsAndConditions: false,
            dismissCompleted: false,
        };

        prismaMock.merchant.findUnique.mockResolvedValue(mockMerchant);

        const merchant = await merchantService.getMerchant({
            shop: 'mock-merchant.myshopify.com',
        });

        expect(merchant).toEqual(mockMerchant);
    });

    it('find a merchant with id', async () => {
        const mockMerchant = {
            id: 'abcd',
            shop: 'mock-merchant.myshopify.com',
            lastNonce: 'abcd-1234',
            accessToken: null,
            scopes: null,
            paymentAddress: null,
            name: 'Mock Merchant',
            acceptedTermsAndConditions: false,
            dismissCompleted: false,
        };

        prismaMock.merchant.findUnique.mockResolvedValue(mockMerchant);

        const merchant = await merchantService.getMerchant({ id: 'abcd' });

        expect(merchant).toEqual(mockMerchant);
    });

    it('create a merchant', async () => {
        const mockMerchant = {
            id: 'abcd',
            shop: 'mock-merchant.myshopify.com',
            lastNonce: 'abcd-1234',
            accessToken: null,
            scopes: null,
            paymentAddress: null,
            name: 'Mock Merchant',
            acceptedTermsAndConditions: false,
            dismissCompleted: false,
        };

        prismaMock.merchant.create.mockResolvedValue(mockMerchant);

        const merchant = await merchantService.createMerchant(
            'abcd',
            'mock-merchant-create.myshopify.com',
            'abcd-1234'
        );

        expect(merchant).toEqual(mockMerchant);
    });

    it('find no merchants', async () => {
        const mockMerchant = {
            id: 'abcd',
            shop: 'mock-merchant.myshopify.com',
            lastNonce: 'abcd-1234',
            accessToken: null,
            scopes: null,
            paymentAddress: null,
            name: 'Mock Merchant',
            acceptedTermsAndConditions: false,
            dismissCompleted: false,
        };

        const merchant = await merchantService.getMerchant({
            shop: 'mock-merchant-create.myshopify.com',
        });

        expect(merchant).not.toEqual(mockMerchant);
    });

    it('update a merchant', async () => {
        const mockMerchantBeforeUpdate = {
            id: 'abcd',
            shop: 'mock-merchant.myshopify.com',
            lastNonce: 'abcd-1234',
            accessToken: null,
            scopes: null,
            paymentAddress: null,
            name: 'Mock Merchant',
            acceptedTermsAndConditions: false,
            dismissCompleted: false,
        };

        const mockMerchantAfterUpdate = {
            id: 'abcd',
            shop: 'mock-merchant.myshopify.com',
            lastNonce: 'efgh-5678',
            accessToken: null,
            scopes: null,
            paymentAddress: null,
            name: 'Mock Merchant',
            acceptedTermsAndConditions: false,
            dismissCompleted: false,
        };

        prismaMock.merchant.update.mockResolvedValue(mockMerchantAfterUpdate);

        const merchant = await merchantService.updateMerchant(mockMerchantBeforeUpdate, { lastNonce: 'efgh-5678' });

        expect(merchant).toEqual(mockMerchantAfterUpdate);
    });

    it('update a merchant failing', async () => {
        const mockMerchantThatDoesNotExist = {
            id: 'abcd',
            shop: 'mock-merchant.myshopify.com',
            lastNonce: 'abcd-1234',
            accessToken: null,
            scopes: null,
            paymentAddress: null,
            name: 'Mock Merchant',
            acceptedTermsAndConditions: false,
            dismissCompleted: false,
        };

        prismaMock.merchant.update.mockRejectedValue(new Error('Failed to update merchant'));

        await expect(
            merchantService.updateMerchant(mockMerchantThatDoesNotExist, {
                lastNonce: 'efgh-5678',
            })
        ).rejects.toThrow();
    });
});
