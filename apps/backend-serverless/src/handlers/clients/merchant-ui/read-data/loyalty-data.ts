import { PrismaClient } from '@prisma/client';
import * as Sentry from '@sentry/serverless';
import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { MerchantService } from '../../../../services/database/merchant-service.database.service.js';
import { createProductsNftResponse } from '../../../../utilities/clients/create-products-response.utility.js';
import { withAuth } from '../../../../utilities/clients/token-authenticate.utility.js';
import { createErrorResponse } from '../../../../utilities/responses/error-response.utility.js';

const prisma = new PrismaClient();

Sentry.AWSLambda.init({
    dsn: process.env.SENTRY_DSN,
    tracesSampleRate: 1.0,
    integrations: [new Sentry.Integrations.Prisma({ client: prisma })],
});

export const loyaltyData = Sentry.AWSLambda.wrapHandler(
    async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> => {
        Sentry.captureEvent({
            message: 'in loyalty-data',
            level: 'info',
            extra: {
                event,
            },
        });

        const merchantService = new MerchantService(prisma);

        try {
            const merchantAuthToken = withAuth(event.cookies);
            let merchant = await merchantService.getMerchant({ id: merchantAuthToken.id });

            let productNftsResponse = await createProductsNftResponse(merchant);
            console.log('products nft', productNftsResponse);

            const responseBodyData = {
                productNfts: productNftsResponse,
            };

            return {
                statusCode: 200,
                body: JSON.stringify(responseBodyData),
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Credentials': true,
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
