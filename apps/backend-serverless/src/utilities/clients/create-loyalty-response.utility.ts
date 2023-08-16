import { LoyaltyProgram, Merchant, PrismaClient, Product, ProductStatus, Tier } from '@prisma/client';
import { PublicKey } from '@solana/web3.js';
import { MerchantService } from '../../services/database/merchant-service.database.service.js';
import { fetchGasKeypair } from '../../services/fetch-gas-keypair.service.js';
import { getPointsMint } from '../../services/transaction-request/fetch-points-setup-transaction.service.js';

export interface LoyaltyResponse {
    loyaltyProgram: LoyaltyProgram;
    productStatus: ProductStatus;
    points: {
        pointsBack: number | null;
        pointsMint: string | null;
    };
    products: Product[];
    tiers: Tier[];
}

const prisma = new PrismaClient();

export const createLoyaltyResponse = async (merchant: Merchant): Promise<LoyaltyResponse> => {
    const merchantService = new MerchantService(prisma);

    const products = await merchantService.getProductsByMerchant(merchant.id);
    const tiers = await merchantService.getTiers(merchant.id);

    let gasKeypair = await fetchGasKeypair();
    let mint = await getPointsMint(gasKeypair.publicKey, new PublicKey(merchant.id));

    return {
        loyaltyProgram: merchant.loyaltyProgram,
        productStatus: merchant.productStatus,
        points: {
            pointsBack: merchant.pointsBack ? merchant.pointsBack : null,
            pointsMint: merchant.pointsBack ? mint.toString() : null,
        },
        products: products,
        tiers: tiers,
    };
};
