import { LoyaltyProgram, Merchant, PrismaClient, Product, ProductStatus, Tier } from '@prisma/client';
import { MerchantService } from '../../services/database/merchant-service.database.service.js';

export interface LoyaltyResponse {
    loyaltyProgram: LoyaltyProgram;
    productStatus: ProductStatus;
    points: {
        pointsMint: string | null;
        pointsBack: number;
    };
    products: Product[];
    tiers: Tier[];
}

const prisma = new PrismaClient();

export const createLoyaltyResponse = async (merchant: Merchant): Promise<LoyaltyResponse> => {
    const merchantService = new MerchantService(prisma);

    const products = await merchantService.getProductsByMerchant(merchant.id);
    const tiers = await merchantService.getTiers(merchant.id);

    return {
        loyaltyProgram: merchant.loyaltyProgram,
        productStatus: merchant.productStatus,
        points: {
            pointsMint: merchant.pointsMint ? merchant.pointsMint : null,
            pointsBack: merchant.pointsBack ? merchant.pointsBack : 0,
        },
        products: products,
        tiers: tiers,
    };
};
