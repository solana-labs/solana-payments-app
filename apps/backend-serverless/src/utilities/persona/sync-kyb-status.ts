import { PrismaClient, Merchant, KybState } from '@prisma/client';
import { makePaymentAppConfigure } from '../../services/shopify/payment-app-configure.service.js';
import { MerchantService } from '../../services/database/merchant-service.database.service.js';
import { getKybState } from './get-kyb-state.js';
import { DependencyError } from '../../errors/dependency.error.js';

export const syncKybState = async (merchant: Merchant, prisma: PrismaClient): Promise<Merchant> => {
    const merchantService = new MerchantService(prisma);

    if (merchant.kybInquiry == null) {
        throw new Error(`Merchant has no KYB inquiry: ${merchant.id}`);
    }

    let kybState: KybState;

    try {
        kybState = await getKybState(merchant.kybInquiry);
    } catch (error) {
        throw new DependencyError(`Could not determine kyb status: ${error}`);
    }

    merchant = await merchantService.updateMerchant(merchant, { kybState });

    return merchant;
};
