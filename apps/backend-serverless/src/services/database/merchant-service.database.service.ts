import { PrismaClient, Merchant } from '@prisma/client'
import { up } from 'inquirer/lib/utils/readline.js'

export type LastNonceUpdate = {
    lastNonce: string
}

export type RedirectUpdate = {
    accessToken: string
    scopes: string
}

export type MerchantUpdate = LastNonceUpdate | RedirectUpdate

export class MerchantService {
    private prisma: PrismaClient

    constructor(prismaClient: PrismaClient) {
        this.prisma = prismaClient
    }

    // function overloads to query the database by shop or id
    async getMerchant(shop: string): Promise<Merchant | null>
    async getMerchant(id: number): Promise<Merchant | null>
    async getMerchant(query: string | number): Promise<Merchant | null> {
        switch (typeof query) {
            case 'string':
                return await this.prisma.merchant.findUnique({
                    where: {
                        shop: query,
                    },
                })
            case 'number':
                return await this.prisma.merchant.findUnique({
                    where: {
                        id: query,
                    },
                })
        }
    }

    async createMerchant(shop: string, lastNonce: string): Promise<Merchant> {
        return await this.prisma.merchant.create({
            data: {
                shop: shop,
                lastNonce: lastNonce,
            },
        })
    }

    async updateMerchant(
        merchant: Merchant,
        update: MerchantUpdate
    ): Promise<Merchant> {
        try {
            return await this.prisma.merchant.update({
                where: {
                    id: merchant.id,
                },
                data: update,
            })
        } catch {
            throw new Error('Failed to update merchant')
        }
    }
}
