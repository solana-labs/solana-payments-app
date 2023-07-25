import { KybState, LoyaltyProgram, Merchant, PrismaClient } from '@prisma/client';
import { getAssociatedTokenAddress } from '@solana/spl-token';
import * as web3 from '@solana/web3.js';
import { USDC_MINT } from '../../configs/tokens.config.js';
import { InvalidInputError } from '../../errors/invalid-input.error.js';
import { MissingExpectedDatabaseRecordError } from '../../errors/missing-expected-database-record.error.js';
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

    loyaltyProgram: LoyaltyProgram;
    pointsMint: string;
    pointsBack: number;
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
}
