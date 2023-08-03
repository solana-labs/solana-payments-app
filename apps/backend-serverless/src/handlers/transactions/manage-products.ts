import { PrismaClient } from '@prisma/client';
import * as Sentry from '@sentry/serverless';
import { Connection, PublicKey, Transaction } from '@solana/web3.js';
import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { InvalidInputError } from '../../errors/invalid-input.error.js';
import { MissingEnvError } from '../../errors/missing-env.error.js';
import { parseAndValidateProductSetupRequestBody } from '../../models/transaction-requests/product-setup-request.model.js';
import { MerchantService } from '../../services/database/merchant-service.database.service.js';
import { fetchGasKeypair } from '../../services/fetch-gas-keypair.service.js';
import { fetchManageProductsTransaction } from '../../services/transaction-request/fetch-products-transaction.service.js';
import { setupCollection, treeSetup } from '../../services/transaction-request/products-transaction.service.js';
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

            console.log('product setup request', productSetupRequest);
            const merchant = await merchantService.getMerchant({ id: merchantAuthToken.id });
            let gasKeypair = await fetchGasKeypair();

            const heliusApiKey = process.env.HELIUS_API_KEY;

            if (heliusApiKey == null) {
                throw new MissingEnvError('helius api');
            }

            const connection = new Connection(`https://rpc.helius.xyz/?api-key=${heliusApiKey}`);

            let newMintAddress;
            let instructions;
            let base;

            const blockhash = await connection.getLatestBlockhash();
            const transaction = new Transaction({
                feePayer: gasKeypair.publicKey,
                blockhash: blockhash.blockhash,
                lastValidBlockHeight: blockhash.lastValidBlockHeight,
            });

            console.log('merchant Id', merchant.id);
            const merchantId = new PublicKey(merchant.id);
            const payer = new PublicKey(productSetupRequest.payer);
            console.log('merchant Id pub', merchantId);

            if (productSetupRequest.maxNFTs) {
                instructions = await treeSetup(gasKeypair, merchantId, payer, productSetupRequest.maxNFTs);
                instructions.forEach(instruction => transaction.add(instruction));
                transaction.feePayer = payer;
                transaction.partialSign(gasKeypair);

                // transaction.instructions.forEach((instruction, i) => {
                //     console.log(`Instruction ${i}:`);

                //     instruction.keys.forEach((key, j) => {
                //         console.log(`  Key ${j}: ${key.pubkey.toString()}`);
                //     });
                // });

                // const sim = await connection.simulateTransaction(transaction);
                // console.log('sim', sim);

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
                instructions.forEach(instruction => transaction.add(instruction));
                transaction.feePayer = payer;
                transaction.partialSign(gasKeypair);
                // const sim = await connection.simulateTransaction(transaction);
                // console.log('sim', sim);

                base = transaction.serialize({ requireAllSignatures: false, verifySignatures: false });
            } else if (productSetupRequest.id) {
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
                // return trasnaction
                // image
            }

            return {
                statusCode: 200,
                body: JSON.stringify({
                    transaction: base,
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
