import { PrismaClient } from '@prisma/client';
import * as Sentry from '@sentry/serverless';
import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { InvalidInputError } from '../../../../errors/invalid-input.error.js';
import { parseAndValidateUpdateLoyaltyRequestBody } from '../../../../models/clients/merchant-ui/update-loyalty-request.model.js';
import { MerchantService } from '../../../../services/database/merchant-service.database.service.js';
import { withAuth } from '../../../../utilities/clients/token-authenticate.utility.js';
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

            const { tiers, products, points, loyaltyProgram, productStatus } = updateLoyaltyRequest;

            if (loyaltyProgram) {
                await merchantService.updateMerchant(merchant, { loyaltyProgram: loyaltyProgram });
            }
            if (productStatus) {
                await merchantService.updateMerchant(merchant, { productStatus: productStatus });
            }

            if (Object.keys(points).length > 0) {
                const merchantUpdateQuery = {
                    ...(points?.back && { pointsBack: points.back }),
                };
                await merchantService.updateMerchant(merchant, merchantUpdateQuery);
            }

            if (Object.keys(tiers).length > 0) {
                // @ts-ignore
                await merchantService.upsertTier(tiers, merchant.id);
            }

            if (Object.keys(products).length > 0) {
                if (products.id == undefined) {
                    throw new InvalidInputError('product id is required');
                }
                // @ts-ignore
                await merchantService.updateProduct({
                    ...products,
                });
            }

            return {
                statusCode: 200,
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
