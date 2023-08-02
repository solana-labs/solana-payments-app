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

        try {
            const merchantAuthToken = withAuth(event.cookies);
            const merchantService = new MerchantService(prisma);
            const tierSetupRequest: TierSetupRequest = parseAndValidateTierSetupRequestBody(JSON.parse(event.body));

            const merchant = await merchantService.getMerchant({ id: merchantAuthToken.id });

            let gasKeypair = await fetchGasKeypair();

            let { id, payer, name, threshold, discount } = tierSetupRequest;

            let transaction;
            let mintAddress;

            if (!id) {
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
