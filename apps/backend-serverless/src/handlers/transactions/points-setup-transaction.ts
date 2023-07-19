import { PrismaClient } from '@prisma/client';
import * as Sentry from '@sentry/serverless';
import * as web3 from '@solana/web3.js';
import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import axios from 'axios';
import { InvalidInputError } from '../../errors/invalid-input.error.js';
import { parseAndValidateTransactionRequestBody } from '../../models/transaction-requests/transaction-request-body.model.js';
import { MerchantService } from '../../services/database/merchant-service.database.service.js';
import { fetchGasKeypair } from '../../services/fetch-gas-keypair.service.js';
import { fetchPointsSetupTransaction } from '../../services/transaction-request/fetch-points-setup-transaction.service.js';
import { withAuth } from '../../utilities/clients/merchant-ui/token-authenticate.utility.js';
import { createErrorResponse } from '../../utilities/responses/error-response.utility.js';
import { encodeTransaction } from '../../utilities/transaction-request/encode-transaction.utility.js';

const prisma = new PrismaClient();

Sentry.AWSLambda.init({
    dsn: process.env.SENTRY_DSN,
    tracesSampleRate: 1.0,
    integrations: [new Sentry.Integrations.Prisma({ client: prisma })],
});

export const pointsSetupTransaction = Sentry.AWSLambda.wrapHandler(
    async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> => {
        Sentry.captureEvent({
            message: 'In points setup transaction handler',
            level: 'info',
            extra: {
                event,
            },
        });

        if (event.body == null) {
            return createErrorResponse(new InvalidInputError('request body'));
        }

        const merchantService = new MerchantService(prisma);

        try {
            let transactionRequestBody = parseAndValidateTransactionRequestBody(JSON.parse(event.body));

            const merchantAuthToken = withAuth(event.cookies);
            let merchant = await merchantService.getMerchant({ id: merchantAuthToken.id });

            let gasKeypair = await fetchGasKeypair();

            const pointsMint = web3.Keypair.generate();

            let pointsSetupTransaction = await fetchPointsSetupTransaction(
                pointsMint.publicKey.toBase58(),
                gasKeypair.publicKey.toBase58(),
                transactionRequestBody.account,
                axios
            );

            let transaction = encodeTransaction(pointsSetupTransaction.transaction);
            transaction.partialSign(pointsMint);

            const transactionBuffer = transaction.serialize({
                verifySignatures: false,
                requireAllSignatures: false,
            });

            return {
                statusCode: 200,
                body: JSON.stringify({
                    transaction: transactionBuffer.toString('base64'),
                    pointsMint: pointsMint.publicKey.toBase58(),
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
