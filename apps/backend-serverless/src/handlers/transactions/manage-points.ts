import { PrismaClient } from '@prisma/client';
import * as Sentry from '@sentry/serverless';
import { PublicKey } from '@solana/web3.js';
import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { InvalidInputError } from '../../errors/invalid-input.error.js';
import {
    PointsUpdateRequest,
    parseAndValidatePointsUpdateRequestBody,
} from '../../models/transaction-requests/points-update-request.model.js';
import { MerchantService } from '../../services/database/merchant-service.database.service.js';
import { fetchGasKeypair } from '../../services/fetch-gas-keypair.service.js';
import { fetchPointsUpdateTransaction } from '../../services/transaction-request/fetch-points-setup-transaction.service.js';
import { withAuth } from '../../utilities/clients/token-authenticate.utility.js';
import { createErrorResponse } from '../../utilities/responses/error-response.utility.js';

const prisma = new PrismaClient();

Sentry.AWSLambda.init({
    dsn: process.env.SENTRY_DSN,
    tracesSampleRate: 1.0,
    integrations: [new Sentry.Integrations.Prisma({ client: prisma })],
});

export const managePointsTransaction = Sentry.AWSLambda.wrapHandler(
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
            console.log('event stuff', event.body);
            const pointsUpdateRequest: PointsUpdateRequest = parseAndValidatePointsUpdateRequestBody(
                JSON.parse(event.body)
            );
            console.log('after parse', pointsUpdateRequest);

            const merchant = await merchantService.getMerchant({ id: merchantAuthToken.id });

            let gasKeypair = await fetchGasKeypair();

            let { back, account } = pointsUpdateRequest;

            let transaction = await fetchPointsUpdateTransaction(gasKeypair, new PublicKey(account), merchant, back);

            transaction.partialSign(gasKeypair);
            console.log('about to send transaction', transaction);

            const transactionBuffer = transaction.serialize({
                verifySignatures: false,
                requireAllSignatures: false,
            });

            return {
                statusCode: 200,
                body: JSON.stringify({
                    transaction: transactionBuffer.toString('base64'),
                    message: 'Points Metadata Update',
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
