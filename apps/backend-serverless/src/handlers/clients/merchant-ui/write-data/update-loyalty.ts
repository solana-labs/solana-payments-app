import { Merchant, PrismaClient } from '@prisma/client';
import * as Sentry from '@sentry/serverless';
import { Keypair, PublicKey } from '@solana/web3.js';
import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { InvalidInputError } from '../../../../errors/invalid-input.error.js';
import { parseAndValidateUpdateLoyaltyRequestBody } from '../../../../models/clients/merchant-ui/update-loyalty-request.model.js';
import { MerchantService } from '../../../../services/database/merchant-service.database.service.js';
import { fetchGasKeypair } from '../../../../services/fetch-gas-keypair.service.js';
import { fetchManageProductsTransaction } from '../../../../services/transaction-request/fetch-manage-products-transaction.service.js';
import { fetchManageTiersTransaction } from '../../../../services/transaction-request/fetch-manage-tiers-transaction.service.js';
import { withAuth } from '../../../../utilities/clients/merchant-ui/token-authenticate.utility.js';
import { filterUndefinedFields } from '../../../../utilities/database/filter-underfined-fields.utility.js';
import { createErrorResponse } from '../../../../utilities/responses/error-response.utility.js';

const prisma = new PrismaClient();

Sentry.AWSLambda.init({
    dsn: process.env.SENTRY_DSN,
    tracesSampleRate: 1.0,
    integrations: [new Sentry.Integrations.Prisma({ client: prisma })],
});

export const updateLoyalty = Sentry.AWSLambda.wrapHandler(
    async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> => {
        Sentry.captureEvent({
            message: 'in update loyalty',
            level: 'info',
        });

        if (event.body == null) {
            return createErrorResponse(new InvalidInputError('missing body in request'));
        }

        try {
            const merchantAuthToken = withAuth(event.cookies);
            const merchantService = new MerchantService(prisma);
            const updateLoyaltyRequest = parseAndValidateUpdateLoyaltyRequestBody(JSON.parse(event.body));

            const merchant = await merchantService.getMerchant({ id: merchantAuthToken.id });

            const { tiers, products, payer, points, loyaltyProgram } = updateLoyaltyRequest;

            const merchantUpdateQuery = {
                ...(loyaltyProgram && { loyaltyProgram: loyaltyProgram }),
                ...(points?.mint && { pointsMint: points.mint }),
                ...(points?.back && { pointsBack: points.back }),
            };

            if (Object.keys(merchantUpdateQuery).length > 0) {
                await merchantService.updateMerchant(merchant, merchantUpdateQuery);
                return createSuccessResponse();
            }

            let gasKeypair = await fetchGasKeypair();

            if (!payer) {
                throw new Error('payer is missing');
            }
            if (tiers && Object.values(tiers).length > 0) {
                const tierUpdateResponse = await handleTierUpdate(tiers, gasKeypair, merchant, merchantService, payer);
                return createSuccessResponse(tierUpdateResponse);
            }

            if (products && Object.values(products).length > 0) {
                const productUpdateResponse = await handleProductUpdate(
                    products,
                    gasKeypair,
                    merchant,
                    merchantService,
                    payer
                );
                return createSuccessResponse(productUpdateResponse);
            }
            return createSuccessResponse();
        } catch (error) {
            return createErrorResponse(error);
        }
    },
    {
        rethrowAfterCapture: false,
    }
);

async function handleTierUpdate(
    tiers: any,
    gasKeypair: Keypair,
    merchant: Merchant,
    merchantService: MerchantService,
    payer: string
) {
    let tierDetails = tiers.id
        ? { ...((await merchantService.getTier(tiers.id)) || {}), ...filterUndefinedFields(tiers) }
        : tiers;
    const { mint, name, threshold, discount } = tierDetails;
    if (!name || !threshold || !discount || !payer) {
        throw new Error('Required tier details are missing');
    }

    const mintAddress = mint ? new PublicKey(mint) : undefined;
    const merchantAddress = new PublicKey(payer);

    const { base: transaction, mintAddress: newMintAddress } = await fetchManageTiersTransaction(
        name,
        threshold,
        discount,
        gasKeypair,
        merchantAddress,
        mintAddress
    );

    if (newMintAddress) {
        tierDetails.mint = newMintAddress.toString();
    }

    tiers.id
        ? await merchantService.updateTier(tierDetails)
        : await merchantService.createTier(merchant.id, tierDetails);

    return {
        transaction,
        mintAddress: newMintAddress?.toString(),
        message: 'tier nft management',
    };
}

function createSuccessResponse(body: any = {}): APIGatewayProxyResultV2 {
    return {
        statusCode: 200,
        body: JSON.stringify(body),
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Credentials': true,
            'Access-Control-Allow-Methods': 'GET,HEAD,OPTIONS,POST,PUT',
        },
    };
}

async function handleProductUpdate(
    products: any,
    gasKeypair: Keypair,
    merchant: Merchant,
    merchantService: MerchantService,
    payer: string
) {
    let product = await merchantService.getProduct(products.id);
    const merchantAddress = new PublicKey(payer);

    let transaction;
    let newMintAddress;

    if (product.mint == null) {
        let response = await fetchManageProductsTransaction(product.name, gasKeypair, merchantAddress);
        transaction = response.base;
        newMintAddress = response.mintAddress;
    }

    await merchantService.updateProduct({
        id: product.id,
        mint: newMintAddress?.toString(),
        active: products.active,
    });

    return {
        transaction,
        mintAddress: newMintAddress?.toString(),
        message: 'product nft management',
    };
}
