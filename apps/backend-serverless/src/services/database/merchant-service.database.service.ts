import { KybState, Merchant, PrismaClient } from '@prisma/client';
import * as web3 from '@solana/web3.js';
import { USDC_MINT } from '../../configs/tokens.config.js';
import { filterUndefinedFields } from '../../utilities/database/filter-underfined-fields.utility.js';
import { findAssociatedTokenAddress } from '../../utilities/pubkeys.utility.js';
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
};

export type FooBarMerchantUpdate = MerchantUpdate;

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

    async updateMerchantWalletAddress(merchant: Merchant, inputPubkeyString: string): Promise<Merchant> {
        const accountType = await getPubkeyType(inputPubkeyString);
        const inputPubkey = new web3.PublicKey(inputPubkeyString);
        const usdcAddress = await findAssociatedTokenAddress(inputPubkey, USDC_MINT);

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
}
