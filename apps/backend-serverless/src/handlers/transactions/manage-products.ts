import { PrismaClient } from '@prisma/client';
import * as Sentry from '@sentry/serverless';
import { PublicKey } from '@solana/web3.js';
import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { InvalidInputError } from '../../errors/invalid-input.error.js';
import { parseAndValidateProductSetupRequestBody } from '../../models/transaction-requests/product-setup-request.model.js';
import { MerchantService } from '../../services/database/merchant-service.database.service.js';
import { fetchGasKeypair } from '../../services/fetch-gas-keypair.service.js';
import {
    setupCollection,
    setupProductMetadata,
    treeSetup,
} from '../../services/transaction-request/products-transaction.service.js';
import { withAuth } from '../../utilities/clients/token-authenticate.utility.js';
import { createErrorResponse } from '../../utilities/responses/error-response.utility.js';
import { constructTransaction } from '../../utilities/transaction.utility.js';

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

        try {
            const merchantAuthToken = withAuth(event.cookies);
            const merchantService = new MerchantService(prisma);
            const productSetupRequest = parseAndValidateProductSetupRequestBody(JSON.parse(event.body));

            const merchant = await merchantService.getMerchant({ id: merchantAuthToken.id });
            let gasKeypair = await fetchGasKeypair();

            let newMintAddress;
            let instructions;
            let base;
            let uri;

            const merchantId = new PublicKey(merchant.id);
            const payer = new PublicKey(productSetupRequest.payer);

            if (productSetupRequest.maxNFTs) {
                instructions = await treeSetup(gasKeypair, merchantId, payer, productSetupRequest.maxNFTs);
                const transaction = await constructTransaction(instructions, payer);
                transaction.partialSign(gasKeypair);

                base = transaction.serialize({ requireAllSignatures: false, verifySignatures: false });
            } else if (productSetupRequest.name && productSetupRequest.symbol && merchant.name) {
                instructions = await setupCollection(
                    gasKeypair,
                    merchantId,
                    payer,
                    productSetupRequest.name,
                    productSetupRequest.symbol,
                    merchant.name
                );
                const transaction = await constructTransaction(instructions, payer);
                transaction.partialSign(gasKeypair);

                base = transaction.serialize({ requireAllSignatures: false, verifySignatures: false });
            } else if (productSetupRequest.id) {
                let product = await merchantService.getProduct(productSetupRequest.id);
                if (!product.image) {
                    throw new Error('product image not availble');
                }
                uri = await setupProductMetadata(product.name, gasKeypair, product.image);
            }

            return {
                statusCode: 200,
                body: JSON.stringify({
                    ...(base && { transaction: base }),
                    ...(newMintAddress && { mintAddress: newMintAddress.toBase58() }),
                    ...(uri && { uri }),
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
