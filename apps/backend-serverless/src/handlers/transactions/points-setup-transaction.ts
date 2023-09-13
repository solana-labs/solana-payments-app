import { PrismaClient } from '@prisma/client';
import * as Sentry from '@sentry/serverless';
import * as web3 from '@solana/web3.js';
import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { InvalidInputError } from '../../errors/invalid-input.error.js';
import { parseAndValidateTransactionRequestBody } from '../../models/transaction-requests/transaction-request-body.model.js';
import { MerchantService } from '../../services/database/merchant-service.database.service.js';
import { fetchGasKeypair } from '../../services/fetch-gas-keypair.service.js';
import {
    fetchPointsSetupTransaction,
    getPointsMint,
} from '../../services/transaction-request/fetch-points-setup-transaction.service.js';
import { withAuth } from '../../utilities/clients/token-authenticate.utility.js';
import { createErrorResponse } from '../../utilities/responses/error-response.utility.js';

const prisma = new PrismaClient();

Sentry.AWSLambda.init({
    dsn: process.env.SENTRY_DSN,
    tracesSampleRate: 1.0,
    integrations: [new Sentry.Integrations.Prisma({ client: prisma })],
});

export const pointsSetupTransaction = Sentry.AWSLambda.wrapHandler(
    async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> => {
        if (event.body == null) {
            return createErrorResponse(new InvalidInputError('request body'));
        }

        const merchantService = new MerchantService(prisma);

        try {
            let transactionRequestBody = parseAndValidateTransactionRequestBody(JSON.parse(event.body));

            const merchantAuthToken = withAuth(event.cookies);
            let merchant = await merchantService.getMerchant({ id: merchantAuthToken.id });

            let gasKeypair = await fetchGasKeypair();

            const pointsMint = await getPointsMint(gasKeypair.publicKey, new web3.PublicKey(merchant.id));

            let pointsSetupTransaction = await fetchPointsSetupTransaction(
                pointsMint,
                gasKeypair,
                new web3.PublicKey(transactionRequestBody.account),
                merchant
            );

            let transaction = pointsSetupTransaction;
            transaction.partialSign(gasKeypair);

            const transactionBuffer = transaction.serialize({
                verifySignatures: false,
                requireAllSignatures: false,
            });

            return {
                statusCode: 200,
                body: JSON.stringify({
                    transaction: transactionBuffer.toString('base64'),
                    message: `Creating ${merchant.name} Points Rewards`,
                }),
            };
        } catch (error) {
            return createErrorResponse(error);
        }
    },
    {
        captureTimeoutWarning: false,
        rethrowAfterCapture: false,
    }
);
