import { LoyaltyProgram, Merchant, PrismaClient, Product, Tier } from '@prisma/client';
import { MerchantService } from '../../../services/database/merchant-service.database.service.js';
import { fetchAllProducts } from '../../../services/shopify/shop-products.service.js';

export interface LoyaltyResponse {
    loyaltyProgram: LoyaltyProgram;
    points: {
        pointsMint: string | null;
        pointsBack: number;
    };
    products: Product[];
    tiers: Tier[];
}

const prisma = new PrismaClient();

function shouldUpdateProducts(lastFetched) {
    if (lastFetched == null) {
        return true;
    } else {
        const now = new Date();
        const twoMinutesLater = new Date(lastFetched.getTime() + 2 * 60000);
        return now > twoMinutesLater;
    }
}

export const createLoyaltyResponse = async (merchant: Merchant): Promise<LoyaltyResponse> => {
    const merchantService = new MerchantService(prisma);

    if (shouldUpdateProducts(merchant.lastFetched)) {
        const fetchedProducts = await fetchAllProducts(merchant);
        await merchantService.upsertProducts(merchant.id, fetchedProducts);
        await merchantService.updateMerchant(merchant, { lastFetched: new Date() });
    }

    const products = await merchantService.getProducts(merchant.id);
    const tiers = await merchantService.getTiers(merchant.id);

    return {
        loyaltyProgram: merchant.loyaltyProgram,
        points: {
            pointsMint: merchant.pointsMint ? merchant.pointsMint : null,
            pointsBack: merchant.pointsBack ? merchant.pointsBack : 0,
        },
        products: products,
        tiers: tiers,
    };
};
