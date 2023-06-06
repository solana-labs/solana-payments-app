import { PrismaClient, Merchant, KybState } from '@prisma/client';
import { filterUndefinedFields } from '../../utilities/database/filter-underfined-fields.utility.js';
import { prismaErrorHandler } from './shared.database.service.js';

export type ShopQuery = {
    shop: string;
};

export type IdQuery = {
    id: string;
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

export type MerchantNameUpdate = {
    name: string;
};

export type MerchantNamePaymentAddressUpdate = {
    paymentAddress: string;
    name: string;
};

export type MerchantUpdate = {
    paymentyAddress: string;
    name: string;
    email: string;
    acceptedTermsAndConditions: boolean;
    dismissCompleted: boolean;
    accessToken: string;
    scopes: string;
    lastNonce: string;
    kybInquiry: string;
    kybState: null | KybState;
};

export class MerchantService {
    private prisma: PrismaClient;

    constructor(prismaClient: PrismaClient) {
        this.prisma = prismaClient;
    }

    async getMerchant(query: MerchantQuery): Promise<Merchant | null> {
        return prismaErrorHandler(
            this.prisma.merchant.findUnique({
                where: query,
            })
        );
    }

    async createMerchant(id: string, shop: string, lastNonce: string): Promise<Merchant> {
        return prismaErrorHandler(
            this.prisma.merchant.create({
                data: {
                    id: id,
                    shop: shop,
                    lastNonce: lastNonce,
                },
            })
        );
    }

    async updateMerchant(merchant: Merchant, update: Partial<MerchantUpdate>): Promise<Merchant> {
        const filteredUpdate = filterUndefinedFields(update);

        return prismaErrorHandler(
            this.prisma.merchant.update({
                where: {
                    id: merchant.id,
                },
                data: filteredUpdate,
            })
        );
    }
}
