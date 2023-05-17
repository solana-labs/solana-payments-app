import * as Sentry from '@sentry/serverless';
import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { requestErrorResponse } from '../../../../utilities/request-response.utility.js';
import { MerchantAuthToken } from '../../../../models/merchant-auth-token.model.js';
import { withAuth } from '../../../../utilities/token-authenticate.utility.js';
import { MerchantService } from '../../../../services/database/merchant-service.database.service.js';
import { PrismaClient } from '@prisma/client';
import { createGeneralResponse } from '../../../../utilities/create-general-response.js';
import { createOnboardingResponse } from '../../../../utilities/create-onboarding-response.utility.js';

Sentry.AWSLambda.init({
    dsn: 'https://dbf74b8a0a0e4927b9269aa5792d356c@o4505168718004224.ingest.sentry.io/4505168722526208',
    tracesSampleRate: 1.0,
});

export const merchantData = Sentry.AWSLambda.wrapHandler(
    async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> => {
        const prisma = new PrismaClient();
        const merchantService = new MerchantService(prisma);

        let merchantAuthToken: MerchantAuthToken;

        try {
            merchantAuthToken = withAuth(event.cookies);
        } catch (error) {
            return requestErrorResponse(error);
        }

        const merchant = await merchantService.getMerchant({ id: merchantAuthToken.id });

        if (merchant == null) {
            return requestErrorResponse(new Error('Merchant not found'));
        }

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
        };
    },
    {
        rethrowAfterCapture: true,
    }
);
