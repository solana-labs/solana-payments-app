import { PrismaClient, Merchant, KybState } from '@prisma/client';
import { makePaymentAppConfigure } from '../../services/shopify/payment-app-configure.service.js';
import { MerchantService } from '../../services/database/merchant-service.database.service.js';
import { getKybState } from './get-kyb-state.js';
import { DependencyError } from '../../errors/dependency.error.js';
import * as Sentry from '@sentry/serverless';
import { ConflictingStateError } from '../../errors/conflicting-state.error.js';

export const syncKybState = async (merchant: Merchant, prisma: PrismaClient): Promise<Merchant> => {
    const merchantService = new MerchantService(prisma);

    try {
        if (merchant.kybInquiry == null) {
            const noInquiryError = new ConflictingStateError('merchant has no kyn inquiry. merchant: ' + merchant.id);
            Sentry.captureException(noInquiryError);
            throw noInquiryError;
        }
        const kybState = await getKybState(merchant.kybInquiry);
        merchant = await merchantService.updateMerchant(merchant, { kybState });
    } catch (error) {
        console.log(error);
        Sentry.captureException(error);
        throw error;
    }

    return merchant;
};
