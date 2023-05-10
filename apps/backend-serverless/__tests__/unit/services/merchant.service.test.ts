import { MerchantService } from '../../../src/services/database/merchant-service.database.service'
import { prismaMock } from '../../../prisma-singleton'

describe('Merchant Testing Suite', () => {
    let merchantService: MerchantService

    beforeEach(() => {
        merchantService = new MerchantService(prismaMock)
    })

    it('find a merchant with shop', async () => {
        const mockMerchant = {
            id: 1,
            shop: 'mock-merchant.myshopify.com',
            lastNonce: 'abcd-1234',
            accessToken: null,
            scopes: null,
        }

        prismaMock.merchant.findUnique.mockResolvedValue(mockMerchant)

        const merchant = await merchantService.getMerchant({
            shop: 'mock-merchant.myshopify.com',
        })

        expect(merchant).toEqual(mockMerchant)
    })

    it('find a merchant with id', async () => {
        const mockMerchant = {
            id: 1,
            shop: 'mock-merchant.myshopify.com',
            lastNonce: 'abcd-1234',
            accessToken: null,
            scopes: null,
        }

        prismaMock.merchant.findUnique.mockResolvedValue(mockMerchant)

        const merchant = await merchantService.getMerchant({ id: 1 })

        expect(merchant).toEqual(mockMerchant)
    })

    it('create a merchant', async () => {
        const mockMerchant = {
            id: 2,
            shop: 'mock-merchant-create.myshopify.com',
            lastNonce: 'abcd-1234',
            accessToken: null,
            scopes: null,
        }

        prismaMock.merchant.create.mockResolvedValue(mockMerchant)

        const merchant = await merchantService.createMerchant(
            'mock-merchant-create.myshopify.com',
            'abcd-1234'
        )

        expect(merchant).toEqual(mockMerchant)
    })

    it('find no merchants', async () => {
        const mockMerchant = {
            id: 2,
            shop: 'mock-merchant-create.myshopify.com',
            lastNonce: 'abcd-1234',
            accessToken: null,
            scopes: null,
        }

        const merchant = await merchantService.getMerchant({
            shop: 'mock-merchant-create.myshopify.com',
        })

        expect(merchant).not.toEqual(mockMerchant)
    })

    it('update a merchant', async () => {
        const mockMerchantBeforeUpdate = {
            id: 1,
            shop: 'mock-merchant.myshopify.com',
            lastNonce: 'abcd-1234',
            accessToken: null,
            scopes: null,
        }

        const mockMerchantAfterUpdate = {
            id: 1,
            shop: 'mock-merchant.myshopify.com',
            lastNonce: 'efgh-5678',
            accessToken: null,
            scopes: null,
        }

        prismaMock.merchant.update.mockResolvedValue(mockMerchantAfterUpdate)

        const merchant = await merchantService.updateMerchant(
            mockMerchantBeforeUpdate,
            { lastNonce: 'efgh-5678' }
        )

        expect(merchant).toEqual(mockMerchantAfterUpdate)
    })

    it('update a merchant failing', async () => {
        const mockMerchantThatDoesNotExist = {
            id: 2,
            shop: 'mock-merchant-dne.myshopify.com',
            lastNonce: 'wxyz-4321',
            accessToken: null,
            scopes: null,
        }

        prismaMock.merchant.update.mockRejectedValue(
            new Error('Failed to update merchant')
        )

        await expect(
            merchantService.updateMerchant(mockMerchantThatDoesNotExist, {
                lastNonce: 'efgh-5678',
            })
        ).rejects.toThrow()
    })
})
