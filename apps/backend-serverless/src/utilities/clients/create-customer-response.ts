import { PaymentRecord, Tier } from '@prisma/client';
import { getAccount, getAssociatedTokenAddress } from '@solana/spl-token';
import { Connection, PublicKey } from '@solana/web3.js';
import { USDC_MINT } from '../../configs/tokens.config.js';
import { MissingEnvError } from '../../errors/missing-env.error.js';
import { MerchantService } from '../../services/database/merchant-service.database.service.js';
import { fetchBalance } from '../../services/helius.service.js';

export interface CustomerResponse {
    amountSpent: number;
    tier: Tier | null;
    customerOwns: boolean;
    points: number | null;
    usdc: number | null;
    nextTier: Tier | null;
    // productNFTs: array().of(productNFTSchema).required(),
}

async function determineTier(
    amountSpent: number,
    tiers: Tier[],
    paymentRecord: PaymentRecord
): Promise<{ currentTier: Tier | null; nextPossibleTier: Tier | null }> {
    let currentTier: Tier | null = null;
    let nextPossibleTier: Tier | null = null;

    for (let i = 0; i < tiers.length; i++) {
        if (amountSpent >= tiers[i].threshold && tiers[i].active) {
            currentTier = tiers[i];
        }

        // Checking if the user will reach a higher tier after the payment.
        if (
            amountSpent + paymentRecord.amount >= tiers[i].threshold &&
            tiers[i].active &&
            (currentTier === null || tiers[i].threshold > currentTier.threshold)
        ) {
            nextPossibleTier = tiers[i];
        }
    }

    // If the next tier is the same as the current tier, the user is not going to upgrade, thus nextPossibleTier should be null.
    if (currentTier !== null && nextPossibleTier !== null && currentTier.id === nextPossibleTier.id) {
        nextPossibleTier = null;
    }

    return { currentTier, nextPossibleTier };
}

async function customerOwnsTier(customerWallet: string, tierMint: string): Promise<boolean> {
    let customerOwns = false;
    try {
        let tierMintPubKey = new PublicKey(tierMint);
        let customerAddress = new PublicKey(customerWallet);
        let customerTokenAddress = await getAssociatedTokenAddress(tierMintPubKey, customerAddress);

        const heliusApiKey = process.env.HELIUS_API_KEY;
        if (heliusApiKey == null) {
            throw new MissingEnvError('helius api');
        }

        const connection = new Connection(`https://rpc.helius.xyz/?api-key=${heliusApiKey}`);
        await getAccount(connection, customerTokenAddress);
        customerOwns = true;
    } catch {}

    return customerOwns;
}

export const createCustomerResponse = async (
    customerWallet: string,
    paymentRecord: PaymentRecord,
    merchantService: MerchantService
): Promise<CustomerResponse> => {
    const merchant = await merchantService.getMerchant({ id: paymentRecord.merchantId });
    const customer = await merchantService.getCustomer(customerWallet.toString(), merchant.id);

    let usdcBalance = await fetchBalance(customerWallet, USDC_MINT.toBase58());

    if (customer == null) {
        return {
            amountSpent: 0,
            tier: null,
            customerOwns: false,
            points: null,
            usdc: usdcBalance,
            nextTier: null,
        };
    }

    let points = merchant.pointsMint ? await fetchBalance(customerWallet, merchant.pointsMint) : null;

    let tiers = await merchantService.getTiers(merchant.id);
    const { currentTier, nextPossibleTier } = await determineTier(customer.amountSpent, tiers, paymentRecord);
    let customerOwns =
        currentTier && currentTier.mint ? await customerOwnsTier(customerWallet, currentTier.mint) : false;

    return {
        amountSpent: customer.amountSpent,
        tier: currentTier,
        customerOwns: customerOwns,
        points: points,
        usdc: usdcBalance,
        nextTier: nextPossibleTier,
    };
};
