import { PrismaClient } from '@prisma/client';
import * as Sentry from '@sentry/serverless';
import { PublicKey } from '@solana/web3.js';
import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { InvalidInputError } from '../../errors/invalid-input.error.js';
import {
    TierSetupRequest,
    parseAndValidateTierSetupRequestBody,
} from '../../models/transaction-requests/tier-setup-request.model.js';
import { MerchantService } from '../../services/database/merchant-service.database.service.js';
import { fetchGasKeypair } from '../../services/fetch-gas-keypair.service.js';
import {
    fetchCreateTiersTransaction,
    fetchUpdateTiersTransaction,
} from '../../services/transaction-request/fetch-manage-tiers-transaction.service.js';
import { withAuth } from '../../utilities/clients/token-authenticate.utility.js';
import { createErrorResponse } from '../../utilities/responses/error-response.utility.js';

const prisma = new PrismaClient();

Sentry.AWSLambda.init({
    dsn: process.env.SENTRY_DSN,
    tracesSampleRate: 1.0,
    integrations: [new Sentry.Integrations.Prisma({ client: prisma })],
});

export const tiersSetupTransaction = Sentry.AWSLambda.wrapHandler(
    async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> => {
        Sentry.captureEvent({
            message: 'in tiers setup transaction',
            level: 'info',
        });

        if (event.body == null) {
            return createErrorResponse(new InvalidInputError('missing body in request'));
        }

        // TODO: create tier if not exist, update tier if exist
        try {
            const merchantAuthToken = withAuth(event.cookies);
            const merchantService = new MerchantService(prisma);
            const tierSetupRequest: TierSetupRequest = parseAndValidateTierSetupRequestBody(JSON.parse(event.body));

            const merchant = await merchantService.getMerchant({ id: merchantAuthToken.id });

            let gasKeypair = await fetchGasKeypair();

            let { id, payer, name, threshold, discount } = tierSetupRequest;

            let transaction;
            let mintAddress;

            console.log('the entire params', tierSetupRequest);
            if (!id) {
                console.log('in create tier');
                // create new tier
                let result = await fetchCreateTiersTransaction(
                    gasKeypair,
                    new PublicKey(payer),
                    name,
                    threshold,
                    discount
                );
                transaction = result.base;
                mintAddress = result.mintAddress;
            } else {
                console.log('in update tier');
                // update existing tier
                let tier = await merchantService.getTier(id);
                transaction = await fetchUpdateTiersTransaction(
                    gasKeypair,
                    new PublicKey(payer),
                    new PublicKey(tier.mint!),
                    name,
                    threshold,
                    discount
                );
            }

            return {
                statusCode: 200,
                body: JSON.stringify({
                    ...(transaction && { transaction }),
                    ...(mintAddress && { mintAddress: mintAddress.toBase58() }),
                    message: 'tier nft management',
                }),
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Credentials': true,
                    'Access-Control-Allow-Methods': 'GET,HEAD,OPTIONS,POST,PUT',
                },
            };
        } catch (error) {
            return createErrorResponse(error);
        }
    },
    {
        rethrowAfterCapture: false,
    }
);

// async function handleTierUpdate(
//     tiers: any,
//     gasKeypair: Keypair,
//     merchant: Merchant,
//     merchantService: MerchantService,
//     payer: string
// ) {
//     let tierDetails = tiers.id
//         ? { ...((await merchantService.getTier(tiers.id)) || {}), ...filterUndefinedFields(tiers) }
//         : tiers;
//     const { mint, name, threshold, discount } = tierDetails;
//     if (!name || !threshold || !discount || !payer) {
//         throw new Error('Required tier details are missing');
//     }

//     const mintAddress = mint ? new PublicKey(mint) : undefined;
//     const merchantAddress = new PublicKey(payer);

//     if (mintAddress) {
//         tierDetails.mint = mintAddress.toString();
//         tierDetails.merchantId = merchant.id;
//     }
// }
