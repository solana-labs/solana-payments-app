import { PaymentRecord, Tier } from '@prisma/client';
import { getAccount, getAssociatedTokenAddress } from '@solana/spl-token';
import { PublicKey } from '@solana/web3.js';
import { USDC_MINT } from '../../configs/tokens.config.js';
import { MerchantService } from '../../services/database/merchant-service.database.service.js';
import { fetchGasKeypair } from '../../services/fetch-gas-keypair.service.js';
import { fetchBalance } from '../../services/helius.service.js';
import { getPointsMint } from '../../services/transaction-request/fetch-points-setup-transaction.service.js';
import { getConnection } from '../connection.utility.js';
import { ProductDetail, createProductsNftResponse } from './create-products-response.utility.js';
export interface CustomerResponse {
    amountSpent: number;
    tier: Tier | null;
    nextTier: Tier | null;
    isFirstTier: boolean;
    customerOwns: boolean;
    points: number | null;
    usdc: number | null;
    customerNfts: ProductDetail[];
}

async function determineTier(
    amountSpent: number,
    tiers: Tier[],
    paymentRecord: PaymentRecord
): Promise<{ currentTier: Tier | null; nextPossibleTier: Tier | null; isFirstTier: boolean }> {
    let currentTier: Tier | null = null;
    let nextPossibleTier: Tier | null = null;
    let isFirstTier: boolean = false; // Adding new variable to track if the next tier is the first one
    let amountToSpend = paymentRecord.amount;

    // Sort the tiers array in ascending order of thresholds.
    tiers.sort((a, b) => a.threshold - b.threshold);

    for (let i = 0; i < tiers.length; i++) {
        // console.log('chekcing if 0', amountSpent, amountToSpend, tiers[i].threshold, tiers[i].active, currentTier);
        // console.log('checking logic', amountSpent >= tiers[i].threshold, tiers[i].active, currentTier === null);
        if (amountSpent >= tiers[i].threshold && tiers[i].active) {
            currentTier = tiers[i];
        }

        // Checking if the user will reach a higher tier after the payment.
        // console.log(
        //     'checking if statements',
        //     amountSpent,
        //     amountToSpend,
        //     tiers[i].threshold,
        //     tiers[i].active,
        //     currentTier
        // );
        // console.log(
        //     'logic',
        //     amountSpent + amountToSpend >= tiers[i].threshold,
        //     tiers[i].active,
        //     currentTier === null || tiers[i].threshold > currentTier.threshold
        // );
        if (
            amountSpent + amountToSpend >= tiers[i].threshold &&
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

    // Check if the next possible tier is the first tier the customer will achieve
    if (currentTier === null && nextPossibleTier !== null) {
        isFirstTier = true;
    }
    // console.log('FINAL TIERSf', currentTier, nextPossibleTier, isFirstTier);

    return { currentTier, nextPossibleTier, isFirstTier };
}

async function customerOwnsTier(customerWallet: string, tierMint: string): Promise<boolean> {
    let customerOwns = false;
    try {
        let tierMintPubKey = new PublicKey(tierMint);
        let customerAddress = new PublicKey(customerWallet);
        let customerTokenAddress = await getAssociatedTokenAddress(tierMintPubKey, customerAddress);

        let connection = getConnection();
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
            isFirstTier: false,
            points: null,
            usdc: usdcBalance,
            nextTier: null,
            customerNfts: [],
        };
    }

    let points: number | null = null;
    if (merchant.pointsMint) {
        let gasKeypair = await fetchGasKeypair();
        const pointsMint = await getPointsMint(gasKeypair.publicKey, new PublicKey(merchant.id));
        points = await fetchBalance(customerWallet, pointsMint.toBase58());
    }

    let tiers = await merchantService.getTiers(merchant.id);
    const { currentTier, nextPossibleTier, isFirstTier } = await determineTier(
        customer.amountSpent,
        tiers,
        paymentRecord
    );
    let customerOwns =
        currentTier && currentTier.mint ? await customerOwnsTier(customerWallet, currentTier.mint) : false;

    let customerNfts: ProductDetail[] = [];

    try {
        customerNfts = (await createProductsNftResponse(merchant)).customerView[customerWallet];
    } catch (err) {
        console.log('error getting customer nfts', err);
    }

    return {
        amountSpent: customer.amountSpent,
        tier: currentTier,
        nextTier: nextPossibleTier,
        isFirstTier: isFirstTier,
        customerOwns: customerOwns,
        points: points,
        usdc: usdcBalance,
        customerNfts: customerNfts,
    };
};
