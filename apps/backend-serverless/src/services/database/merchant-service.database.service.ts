import { PrismaClient, Merchant } from '@prisma/client'

export class MerchantService {
    private prisma: PrismaClient

    constructor(prismaClient: PrismaClient) {
        this.prisma = prismaClient
    }

    async getMerchant(shop: string): Promise<Merchant | null> {
        return await this.prisma.merchant.findUnique({
            where: { shop: shop },
        })
    }

    async createMerchant(shop: string, lastNonce: string): Promise<Merchant> {
        return await this.prisma.merchant.create({
            data: {
                shop: shop,
                lastNonce: lastNonce,
            },
        })
    }
}
