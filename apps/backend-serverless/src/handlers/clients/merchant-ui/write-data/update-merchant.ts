import * as Sentry from '@sentry/serverless';
import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { KybState, Merchant, PrismaClient } from '@prisma/client';
import { MerchantService, MerchantUpdate } from '../../../../services/database/merchant-service.database.service.js';
import { requestErrorResponse } from '../../../../utilities/responses/request-response.utility.js';
import { MerchantAuthToken } from '../../../../models/clients/merchant-ui/merchant-auth-token.model.js';
import { withAuth } from '../../../../utilities/clients/merchant-ui/token-authenticate.utility.js';
import {
    MerchantUpdateRequest,
    parseAndValidatePaymentAddressRequestBody,
} from '../../../../models/clients/merchant-ui/payment-address-request.model.js';
import { createGeneralResponse } from '../../../../utilities/clients/merchant-ui/create-general-response.js';
import { createOnboardingResponse } from '../../../../utilities/clients/merchant-ui/create-onboarding-response.utility.js';
import { ErrorMessage, ErrorType, errorResponse } from '../../../../utilities/responses/error-response.utility.js';
import { syncKybState } from '../../../../utilities/persona/sync-kyb-status.js';

const prisma = new PrismaClient();

Sentry.AWSLambda.init({
    dsn: process.env.SENTRY_DSN,
    tracesSampleRate: 1.0,
    integrations: [new Sentry.Integrations.Prisma({ client: prisma })],
});

export const updateMerchant = Sentry.AWSLambda.wrapHandler(
    async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> => {
        const merchantService = new MerchantService(prisma);

        let merchantAuthToken: MerchantAuthToken;
        let merchantUpdateRequest: MerchantUpdateRequest;

        try {
            merchantAuthToken = withAuth(event.cookies);
        } catch (error) {
            return errorResponse(ErrorType.unauthorized, ErrorMessage.unauthorized);
        }

        if (event.body == null) {
            return errorResponse(ErrorType.badRequest, ErrorMessage.missingBody);
        }

        try {
            merchantUpdateRequest = parseAndValidatePaymentAddressRequestBody(JSON.parse(event.body));
        } catch (error) {
            return errorResponse(ErrorType.badRequest, ErrorMessage.invalidRequestBody);
        }

        if (
            merchantUpdateRequest.name == null &&
            merchantUpdateRequest.paymentAddress == null &&
            merchantUpdateRequest.acceptedTermsAndConditions == null &&
            merchantUpdateRequest.dismissCompleted == null &&
            merchantUpdateRequest.kybInquiry == null
        ) {
            return errorResponse(ErrorType.badRequest, ErrorMessage.invalidRequestBody);
        }

        let merchant: Merchant | null;

        try {
            merchant = await merchantService.getMerchant({ id: merchantAuthToken.id });
        } catch (error) {
            return errorResponse(ErrorType.internalServerError, ErrorMessage.databaseAccessError);
        }

        if (merchant == null) {
            return errorResponse(ErrorType.notFound, ErrorMessage.unknownMerchant);
        }

        const merchantUpdateQuery = {};

        if (merchantUpdateRequest.name != null) {
            merchantUpdateQuery['name'] = merchantUpdateRequest.name;
        }

        if (merchantUpdateRequest.paymentAddress != null) {
            merchantUpdateQuery['paymentAddress'] = merchantUpdateRequest.paymentAddress;
        }

        if (merchantUpdateRequest.acceptedTermsAndConditions != null) {
            merchantUpdateQuery['acceptedTermsAndConditions'] = merchantUpdateRequest.acceptedTermsAndConditions;
        }

        if (merchantUpdateRequest.dismissCompleted != null) {
            merchantUpdateQuery['dismissCompleted'] = merchantUpdateRequest.dismissCompleted;
        }

        if (merchantUpdateRequest.kybInquiry != null) {
            merchantUpdateQuery['kybInquiry'] = merchantUpdateRequest.kybInquiry;
        }

        try {
            merchant = await merchantService.updateMerchant(merchant, merchantUpdateQuery as MerchantUpdate);
        } catch {
            return errorResponse(ErrorType.internalServerError, ErrorMessage.internalServerError);
        }

        if (merchant.kybInquiry && merchant.kybState !== KybState.finished && merchant.kybState !== KybState.failed) {
            try {
                merchant = await syncKybState(merchant);
            } catch (error) {
                return errorResponse(ErrorType.unauthorized, ErrorMessage.unauthorized);
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
        };
    },
    {
        rethrowAfterCapture: true,
    }
);
