import { KybState, Merchant, PrismaClient } from '@prisma/client';
import * as Sentry from '@sentry/serverless';
import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import axios from 'axios';
import { MerchantAuthToken } from '../../../../models/clients/merchant-ui/merchant-auth-token.model.js';
import {
    MerchantUpdateRequest,
    parseAndValidatePaymentAddressRequestBody,
} from '../../../../models/clients/merchant-ui/payment-address-request.model.js';
import { contingentlyHandleAppConfigure } from '../../../../services/business-logic/contigently-handle-app-configure.service.js';
import { MerchantService, MerchantUpdate } from '../../../../services/database/merchant-service.database.service.js';
import {
    GeneralResponse,
    createGeneralResponse,
} from '../../../../utilities/clients/merchant-ui/create-general-response.js';
import {
    OnboardingResponse,
    createOnboardingResponse,
} from '../../../../utilities/clients/merchant-ui/create-onboarding-response.utility.js';
import { withAuth } from '../../../../utilities/clients/merchant-ui/token-authenticate.utility.js';
import { syncKybState } from '../../../../utilities/persona/sync-kyb-status.js';
import { createErrorResponse } from '../../../../utilities/responses/error-response.utility.js';
import { InvalidInputError } from '../../../../errors/invalid-input.error.js';
import { MissingExpectedDatabaseRecordError } from '../../../../errors/missing-expected-database-record.error.js';
import { PubkeyType, getPubkeyType } from '../../../../services/helius.service.js';

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

        console.log('hello merchant');

        try {
            merchantAuthToken = withAuth(event.cookies);
        } catch (error) {
            return createErrorResponse(error);
        }

        if (event.body == null) {
            return createErrorResponse(new InvalidInputError('missing body in request'));
        }

        try {
            merchantUpdateRequest = parseAndValidatePaymentAddressRequestBody(JSON.parse(event.body));
        } catch (error) {
            return createErrorResponse(error);
        }

        console.log(merchantUpdateRequest);

        if (
            merchantUpdateRequest.name == null &&
            merchantUpdateRequest.paymentAddress == null &&
            merchantUpdateRequest.acceptedTermsAndConditions == null &&
            merchantUpdateRequest.dismissCompleted == null &&
            merchantUpdateRequest.kybInquiry == null
        ) {
            return createErrorResponse(new InvalidInputError('no relevant fields in request body'));
        }

        let merchant: Merchant | null;

        try {
            merchant = await merchantService.getMerchant({ id: merchantAuthToken.id });
        } catch (error) {
            return createErrorResponse(error);
        }

        if (merchant == null) {
            return createErrorResponse(new MissingExpectedDatabaseRecordError('merchant'));
        }

        const merchantUpdateQuery = {};

        if (merchantUpdateRequest.name != null) {
            merchantUpdateQuery['name'] = merchantUpdateRequest.name;
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

        if (merchantUpdateRequest.paymentAddress != null) {
            try {
                merchant = await merchantService.updateMerchantWalletAddress(
                    merchant,
                    merchantUpdateRequest.paymentAddress
                );
            } catch (error) {
                return createErrorResponse(error);
            }
        }

        try {
            merchant = await merchantService.updateMerchant(merchant, merchantUpdateQuery as MerchantUpdate);
        } catch (error) {
            return createErrorResponse(error);
        }

        if (merchant.kybInquiry && merchant.kybState !== KybState.finished && merchant.kybState !== KybState.failed) {
            try {
                merchant = await syncKybState(merchant, prisma);
            } catch (error) {
                Sentry.captureException(error);
            }

            if (merchant.kybState === KybState.finished) {
                try {
                    merchant = await contingentlyHandleAppConfigure(merchant, axios, prisma);
                } catch (error) {
                    // TODO: This would be worse, if it throws trying to do app configure, figure out what has to happen here
                    Sentry.captureException(error);
                }
            }
        }

        let generalResponse: GeneralResponse;
        let onboardingResponse: OnboardingResponse;

        try {
            generalResponse = await createGeneralResponse(merchantAuthToken, prisma);
            onboardingResponse = createOnboardingResponse(merchant);
        } catch (error) {
            return createErrorResponse(error);
        }

        const responseBodyData = {
            merchantData: {
                name: merchant.name,
                paymentAddress: merchant.walletAddress ?? merchant.tokenAddress,
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
                'Access-Control-Allow-Methods': 'GET,HEAD,OPTIONS,POST,PUT',
            },
        };
    },
    {
        rethrowAfterCapture: true,
    }
);
