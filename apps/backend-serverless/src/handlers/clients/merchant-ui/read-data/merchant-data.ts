import { KybState, PrismaClient } from '@prisma/client';
import * as Sentry from '@sentry/serverless';
import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import axios from 'axios';
import { contingentlyHandleAppConfigure } from '../../../../services/business-logic/contigently-handle-app-configure.service.js';
import { MerchantService } from '../../../../services/database/merchant-service.database.service.js';
import { createGeneralResponse } from '../../../../utilities/clients/create-general-response.js';
import { createLoyaltyResponse } from '../../../../utilities/clients/create-loyalty-response.utility.js';
import { createOnboardingResponse } from '../../../../utilities/clients/create-onboarding-response.utility.js';
import { withAuth } from '../../../../utilities/clients/token-authenticate.utility.js';
import { syncKybState } from '../../../../utilities/persona/sync-kyb-status.js';
import { createErrorResponse } from '../../../../utilities/responses/error-response.utility.js';

const prisma = new PrismaClient();

Sentry.AWSLambda.init({
    dsn: process.env.SENTRY_DSN,
    tracesSampleRate: 1.0,
    integrations: [new Sentry.Integrations.Prisma({ client: prisma })],
});

export const merchantData = Sentry.AWSLambda.wrapHandler(
    async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> => {
        const merchantService = new MerchantService(prisma);

        try {
            const merchantAuthToken = withAuth(event.cookies);
            let merchant = await merchantService.getMerchant({ id: merchantAuthToken.id });

            if (
                merchant.kybInquiry &&
                merchant.kybState !== KybState.finished &&
                merchant.kybState !== KybState.failed
            ) {
                try {
                    merchant = await syncKybState(merchant, prisma);
                } catch (error) {
                    console.log('error with kyb', error);
                    Sentry.captureException(error);
                    await Sentry.flush(2000);
                }
            }

            if (merchant.kybState === KybState.finished) {
                try {
                    merchant = await contingentlyHandleAppConfigure(merchant, axios, prisma);
                } catch {
                    // It's possible for this to throw but we should capture and log alll errors underneath this
                    // It's better if we just return the merchant data here and handle the issue elsewhere
                }
            }

            const generalResponse = await createGeneralResponse(merchantAuthToken, prisma);
            const onboardingResponse = createOnboardingResponse(merchant);
            const loyaltyResponse = await createLoyaltyResponse(merchant);
            const responseBodyData = {
                merchantData: {
                    shop: merchant.shop,
                    name: merchant.name,
                    paymentAddress: merchant.walletAddress ?? merchant.tokenAddress,
                    onboarding: onboardingResponse,
                    loyaltyDetails: loyaltyResponse,
                },
                general: generalResponse,
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
