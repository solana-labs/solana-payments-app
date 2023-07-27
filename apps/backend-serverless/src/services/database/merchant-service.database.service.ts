import { KybState, LoyaltyProgram, Merchant, PrismaClient, Product, Tier } from '@prisma/client';
import { getAssociatedTokenAddress } from '@solana/spl-token';
import * as web3 from '@solana/web3.js';
import { USDC_MINT } from '../../configs/tokens.config.js';
import { InvalidInputError } from '../../errors/invalid-input.error.js';
import { MissingExpectedDatabaseRecordError } from '../../errors/missing-expected-database-record.error.js';
import { ProductNode } from '../../models/shopify-graphql-responses/shop-products.model.js';
import { filterUndefinedFields } from '../../utilities/database/filter-underfined-fields.utility.js';
import { PubkeyType, getPubkeyType } from '../helius.service.js';
import { prismaErrorHandler } from './shared.database.service.js';

export type ShopQuery = {
    shop: string;
};

export type IdQuery = {
    id: string;
};

export type MerchantQuery = ShopQuery | IdQuery;

export type MerchantUpdate = {
    paymentAddress: string;
    name: string;
    email: string;
    acceptedTermsAndConditions: boolean;
    acceptedPrivacyPolicy: boolean;
    dismissCompleted: boolean;
    accessToken: string;
    scopes: string;
    lastNonce: string;
    kybInquiry: string;
    kybState: KybState;
    active: boolean;
    lastFetched: Date;

    loyaltyProgram: LoyaltyProgram;
    pointsMint: string;
    pointsBack: number;
};

export type ProductUpdate = {
    name: string;
    image: string;
    active: boolean;
};

export type TierUpdate = {
    id?: number;
    name?: string;
    threshold?: number;
    discount?: number;
    active?: boolean;
};

export class MerchantService {
    private prisma: PrismaClient;

    constructor(prismaClient: PrismaClient) {
        this.prisma = prismaClient;
    }

    async getMerchant(query: MerchantQuery): Promise<Merchant> {
        const merchant = await prismaErrorHandler(
            this.prisma.merchant.findUnique({
                where: query,
                include: {
                    products: true, // include associated products
                    tiers: true, // include associated tiers
                },
            })
        );

        if (merchant == null) {
            throw new MissingExpectedDatabaseRecordError(
                'Could not find merchant ' + JSON.stringify(query) + ' in database'
            );
        }
        return merchant;
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

    async updateMerchantWalletAddress(merchant: Merchant, inputPubkeyString: string): Promise<Merchant> {
        let accountType: PubkeyType;
        try {
            accountType = await getPubkeyType(inputPubkeyString);
        } catch (error) {
            throw new InvalidInputError('Make sure account is created and has SOL');
        }
        const inputPubkey = new web3.PublicKey(inputPubkeyString);
        const usdcAddress = await getAssociatedTokenAddress(USDC_MINT, inputPubkey);

        let updatedWalletAddress: string | null = null;
        let updatedTokenAddress: string | null = null;

        switch (accountType) {
            case PubkeyType.native:
                updatedWalletAddress = inputPubkey.toBase58();
                updatedTokenAddress = usdcAddress.toBase58();
                break;
            case PubkeyType.token:
                updatedTokenAddress = inputPubkey.toBase58();
                break;
        }

        return prismaErrorHandler(
            this.prisma.merchant.update({
                where: {
                    id: merchant.id,
                },
                data: {
                    walletAddress: updatedWalletAddress,
                    tokenAddress: updatedTokenAddress,
                },
            })
        );
    }

    async upsertProducts(merchantId: string, products: ProductNode[]): Promise<Product[]> {
        // 1. Fetch all existing products for the merchant.
        const existingProducts = await this.prisma.product.findMany({
            where: { merchantId: merchantId },
        });

        // 2. Create a Set of product IDs from the passed-in array.
        const newProductIds = new Set(products.map(product => product.id));

        // 3. Identify the products that exist in the database but not in the passed-in array.
        const productsToDelete = existingProducts.filter(product => !newProductIds.has(product.id));

        // 4. Create delete actions for the products to be deleted.
        const deleteActions = productsToDelete.map(product =>
            this.prisma.product.delete({ where: { id: product.id } })
        );

        // 5. Create upsert actions for the passed-in products.
        const upsertActions = products.map(product =>
            this.prisma.product.upsert({
                where: { id: product.id },
                update: {
                    name: product.title,
                    image: product.handle,
                },
                create: {
                    id: product.id,
                    name: product.title,
                    image: product.handle,
                    merchantId: merchantId,
                },
            })
        );

        // 6. Perform the delete and upsert actions in a transaction.
        const transactionResults = await this.prisma.$transaction([...deleteActions, ...upsertActions]);

        // 7. Filter out the results of the delete actions to return only the upserted products.
        const upsertedProducts = transactionResults.slice(deleteActions.length) as Product[];

        return upsertedProducts;
    }

    async toggleProduct(product: { productId?: string; active?: boolean }): Promise<Product> {
        return await prismaErrorHandler(
            this.prisma.product.update({
                where: { id: product.productId },
                data: { active: product.active },
            })
        );
    }

    async upsertTier(merchantId: string, tier: TierUpdate): Promise<Tier> {
        const filteredUpdate = filterUndefinedFields(tier);
        return prismaErrorHandler(
            this.prisma.tier.upsert({
                where: { id: tier.id },
                update: filteredUpdate,
                create: {
                    ...filteredUpdate,
                    merchantId: merchantId,
                },
            })
        );
    }

    async getProducts(merchantId: string): Promise<Product[]> {
        return prismaErrorHandler(
            this.prisma.product.findMany({
                where: { merchantId: merchantId },
            })
        );
    }

    async getTiers(merchantId: string): Promise<Tier[]> {
        return prismaErrorHandler(
            this.prisma.tier.findMany({
                where: { merchantId: merchantId },
            })
        );
    }
}
