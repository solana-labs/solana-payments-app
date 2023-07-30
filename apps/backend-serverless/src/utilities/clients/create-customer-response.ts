import { PaymentRecord, Tier } from '@prisma/client';
import { USDC_MINT } from '../../configs/tokens.config.js';
import { MerchantService } from '../../services/database/merchant-service.database.service.js';
import { fetchBalance } from '../../services/helius.service.js';

export interface CustomerResponse {
    amountSpent: number;
    tier: Tier | null;
    points: number | null;
    usdc: number | null;
    // productNFTs: array().of(productNFTSchema).required(),
}

export const createCustomerResponse = async (
    customerWallet: string,
    paymentRecord: PaymentRecord,
    merchantService: MerchantService
): Promise<CustomerResponse> => {
    const merchant = await merchantService.getMerchant({ id: paymentRecord.merchantId });
    const customer = await merchantService.getCustomer(customerWallet.toString(), merchant.id);

    let usdcBalance = await fetchBalance(customerWallet, USDC_MINT.toBase58());

    let points;
    if (merchant.pointsMint) {
        points = await fetchBalance(customerWallet, merchant.pointsMint);
    }

    let tiers = await merchantService.getTiers(merchant.id);

    let customerTier: Tier | null = null;
    for (let i = 0; i < tiers.length; i++) {
        if (customer.amountSpent < tiers[i].threshold) {
            break;
        }
        if (tiers[i].active) {
            customerTier = tiers[i];
        }
    }

    return {
        amountSpent: customer.amountSpent,
        tier: customerTier,
        points: points,
        usdc: usdcBalance,
    };
};
