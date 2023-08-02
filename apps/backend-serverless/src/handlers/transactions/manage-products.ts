import { PrismaClient } from '@prisma/client';
import * as Sentry from '@sentry/serverless';
import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { InvalidInputError } from '../../errors/invalid-input.error.js';
import { parseAndValidateProductSetupRequestBody } from '../../models/transaction-requests/product-setup-request.model.js';
import { MerchantService } from '../../services/database/merchant-service.database.service.js';
import { fetchGasKeypair } from '../../services/fetch-gas-keypair.service.js';
import { fetchManageProductsTransaction } from '../../services/transaction-request/fetch-manage-products-transaction.service.js';
import { withAuth } from '../../utilities/clients/token-authenticate.utility.js';
import { createErrorResponse } from '../../utilities/responses/error-response.utility.js';

const prisma = new PrismaClient();

Sentry.AWSLambda.init({
    dsn: process.env.SENTRY_DSN,
    tracesSampleRate: 1.0,
    integrations: [new Sentry.Integrations.Prisma({ client: prisma })],
});

export const productsSetupTransaction = Sentry.AWSLambda.wrapHandler(
    async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> => {
        Sentry.captureEvent({
            message: 'in products setup transaction',
            level: 'info',
        });

        if (event.body == null) {
            return createErrorResponse(new InvalidInputError('missing body in request'));
        }

        // TODO: this function will init tree, create collection nft, upload nft metadata

        try {
            const merchantAuthToken = withAuth(event.cookies);
            const merchantService = new MerchantService(prisma);
            const productSetupRequest = parseAndValidateProductSetupRequestBody(JSON.parse(event.body));

            const merchant = await merchantService.getMerchant({ id: merchantAuthToken.id });

            let gasKeypair = await fetchGasKeypair();

            let product = await merchantService.getProduct(productSetupRequest.id);
            if (!product.image) {
                throw new Error('product image not availble');
            }

            let { base: transaction, mintAddress: newMintAddress } = await fetchManageProductsTransaction(
                product.name,
                gasKeypair,
                new PublicKey(productSetupRequest.payer),
                product.image
            );
            let transaction;
            let newMintAddress;

            return {
                statusCode: 200,
                body: JSON.stringify({
                    transaction,
                    ...(newMintAddress && { mintAddress: newMintAddress.toBase58() }),
                    message: 'product nft management',
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
