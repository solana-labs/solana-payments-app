import { MerchantService } from '../src/services/database/merchant-service.database.service'
import { PrismaClient } from '@prisma/client'
import { prismaMock } from '../prisma-singleton'

describe('Merchant Testing Suite', () => {
    let merchantService: MerchantService

    beforeEach(() => {
        merchantService = new MerchantService(prismaMock)
    })

    it('find a merchant', async () => {
        const mockMerchant = {
            id: 1,
            shop: 'mock-merchant.myshopify.com',
            lastNonce: 'abcd-1234',
            accessToken: null,
            scopes: null,
        }

        prismaMock.merchant.findUnique.mockResolvedValue(mockMerchant)

        const merchant = await merchantService.getMerchant(
            'mock-merchant.myshopify.com'
        )

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

        const merchant = await merchantService.getMerchant(
            'mock-merchant-create.myshopify.com'
        )

        expect(merchant).not.toEqual(mockMerchant)
    })
})
