import { Merchant, PrismaClient } from '@prisma/client';
import { ConflictingStateError } from '../../errors/conflicting-state.error.js';
import { MerchantService } from '../../services/database/merchant-service.database.service.js';
import { createErrorResponse } from '../responses/error-response.utility.js';
import { getKybState } from './get-kyb-state.js';

export const syncKybState = async (merchant: Merchant, prisma: PrismaClient): Promise<Merchant> => {
    const merchantService = new MerchantService(prisma);

    try {
        if (merchant.kybInquiry == null) {
            throw new ConflictingStateError('merchant has no kyn inquiry. merchant: ' + merchant.id);
        }
        const kybState = await getKybState(merchant.kybInquiry);
        merchant = await merchantService.updateMerchant(merchant, { kybState });
    } catch (error) {
        createErrorResponse(error);
    }

    return merchant;
};
