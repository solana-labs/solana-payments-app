import { PrismaClient, Merchant } from '@prisma/client';

export type ShopQuery = {
    shop: string;
};

export type IdQuery = {
    id: number;
};

export type MerchantQuery = ShopQuery | IdQuery;

export type LastNonceUpdate = {
    lastNonce: string;
};

export type RedirectUpdate = {
    accessToken: string;
    scopes: string;
};

export type PaymentAddressUpdate = {
    paymentAddress: string;
};

export type MerchantUpdate = LastNonceUpdate | RedirectUpdate | PaymentAddressUpdate;

export class MerchantService {
    private prisma: PrismaClient;

    constructor(prismaClient: PrismaClient) {
        this.prisma = prismaClient;
    }

    async getMerchant(query: MerchantQuery): Promise<Merchant | null> {
        return await this.prisma.merchant.findUnique({
            where: query,
        });
    }

    async createMerchant(shop: string, lastNonce: string): Promise<Merchant> {
        try {
            return await this.prisma.merchant.create({
                data: {
                    shop: shop,
                    lastNonce: lastNonce,
                },
            });
        } catch {
            throw new Error('Failed to create merchant');
        }
    }

    async updateMerchant(merchant: Merchant, update: MerchantUpdate): Promise<Merchant> {
        try {
            return await this.prisma.merchant.update({
                where: {
                    id: merchant.id,
                },
                data: update,
            });
        } catch {
            throw new Error('Failed to update merchant');
        }
    }
}
