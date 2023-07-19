import { LoyaltyProgram, Merchant } from '@prisma/client';

export interface LoyaltyResponse {
    loyaltyProgram: LoyaltyProgram;
    pointsMint: string | null;
    pointsBack: number;
}
export const createLoyaltyResponse = (merchant: Merchant): LoyaltyResponse => {
    return {
        loyaltyProgram: merchant.loyaltyProgram,
        pointsMint: merchant.pointsMint ? merchant.pointsMint : null,
        pointsBack: merchant.pointsBack ? merchant.pointsBack : 0,
    };
};
