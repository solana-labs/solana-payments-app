import { KybState, Merchant, PrismaClient } from '@prisma/client';
import * as Sentry from '@sentry/serverless';
import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import axios from 'axios';
import { MerchantAuthToken } from '../../../../models/clients/merchant-ui/merchant-auth-token.model.js';
import { contingentlyHandleAppConfigure } from '../../../../services/business-logic/contigently-handle-app-configure.service.js';
import { MerchantService } from '../../../../services/database/merchant-service.database.service.js';
import { createGeneralResponse } from '../../../../utilities/clients/merchant-ui/create-general-response.js';
import { createOnboardingResponse } from '../../../../utilities/clients/merchant-ui/create-onboarding-response.utility.js';
import { withAuth } from '../../../../utilities/clients/merchant-ui/token-authenticate.utility.js';
import { syncKybState } from '../../../../utilities/persona/sync-kyb-status.js';
import { ErrorMessage, ErrorType, errorResponse } from '../../../../utilities/responses/error-response.utility.js';

const prisma = new PrismaClient();

Sentry.AWSLambda.init({
    dsn: process.env.SENTRY_DSN,
    tracesSampleRate: 1.0,
    integrations: [new Sentry.Integrations.Prisma({ client: prisma })],
});

export const merchantData = Sentry.AWSLambda.wrapHandler(
    async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> => {
        const merchantService = new MerchantService(prisma);

        let merchantAuthToken: MerchantAuthToken;

        try {
            merchantAuthToken = withAuth(event.cookies);
        } catch (error) {
            return errorResponse(ErrorType.unauthorized, ErrorMessage.unauthorized);
        }

        let merchant: Merchant | null;

        try {
            merchant = await merchantService.getMerchant({ id: merchantAuthToken.id });
        } catch (error) {
            return errorResponse(ErrorType.unauthorized, ErrorMessage.databaseAccessError);
        }

        if (merchant == null) {
            return errorResponse(ErrorType.notFound, merchantAuthToken.id);
        }

        if (merchant.kybInquiry && merchant.kybState !== KybState.finished && merchant.kybState !== KybState.failed) {
            try {
                merchant = await syncKybState(merchant, prisma);
            } catch (error) {
                // Maybe we don't wana throw in this state though
                // TODO: decide if we want to throw here
                // TODO: Log this
            }

            if (merchant.kybState === KybState.finished) {
                try {
                    merchant = await contingentlyHandleAppConfigure(merchant, axios, prisma);
                } catch (error) {
                    // Maybe we don't wana throw in this state though
                    // TODO: decide if we want to throw here
                    // TODO: Log this
                }
            }
        }

        // TODO: try/catch this
        const generalResponse = await createGeneralResponse(merchantAuthToken, prisma);
        const onboardingResponse = createOnboardingResponse(merchant);

        // TODO: Create a type for this
        const responseBodyData = {
            merchantData: {
                name: merchant.name,
                paymentAddress: merchant.paymentAddress,
                onboarding: onboardingResponse,
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
    },
    {
        rethrowAfterCapture: true,
    }
);
