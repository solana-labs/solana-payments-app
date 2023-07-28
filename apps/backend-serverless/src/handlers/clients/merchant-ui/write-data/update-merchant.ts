import { KybState, PrismaClient } from '@prisma/client';
import * as Sentry from '@sentry/serverless';
import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import axios from 'axios';
import { InvalidInputError } from '../../../../errors/invalid-input.error.js';
import { parseAndValidatePaymentAddressRequestBody } from '../../../../models/clients/merchant-ui/payment-address-request.model.js';
import { contingentlyHandleAppConfigure } from '../../../../services/business-logic/contigently-handle-app-configure.service.js';
import { MerchantService, MerchantUpdate } from '../../../../services/database/merchant-service.database.service.js';
import { withAuth } from '../../../../utilities/clients/merchant-ui/token-authenticate.utility.js';
import { syncKybState } from '../../../../utilities/persona/sync-kyb-status.js';
import { createErrorResponse } from '../../../../utilities/responses/error-response.utility.js';

const prisma = new PrismaClient();

Sentry.AWSLambda.init({
    dsn: process.env.SENTRY_DSN,
    tracesSampleRate: 1.0,
    integrations: [new Sentry.Integrations.Prisma({ client: prisma })],
});

export const updateMerchant = Sentry.AWSLambda.wrapHandler(
    async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> => {
        Sentry.captureEvent({
            message: 'in update-merchant',
            level: 'info',
        });

        const merchantService = new MerchantService(prisma);
        if (event.body == null) {
            return createErrorResponse(new InvalidInputError('missing body in request'));
        }

        try {
            const merchantAuthToken = withAuth(event.cookies);
            let merchant = await merchantService.getMerchant({ id: merchantAuthToken.id });

            const merchantUpdateRequest = parseAndValidatePaymentAddressRequestBody(JSON.parse(event.body));

            const keysToCheck = [
                'name',
                'paymentAddress',
                'acceptedTermsAndConditions',
                'acceptedPrivacyPolicy',
                'dismissCompleted',
                'kybInquiry',
            ];

            if (keysToCheck.every(key => merchantUpdateRequest[key] == null)) {
                throw new InvalidInputError('No fields to update in request body');
            }

            let merchantUpdateQuery = {};

            keysToCheck.forEach(key => {
                if (merchantUpdateRequest[key] != null) {
                    merchantUpdateQuery[key] = merchantUpdateRequest[key];
                }
            });

            if (merchantUpdateRequest.paymentAddress != null) {
                merchant = await merchantService.updateMerchantWalletAddress(
                    merchant,
                    merchantUpdateRequest.paymentAddress
                );
            } else {
                merchant = await merchantService.updateMerchant(merchant, merchantUpdateQuery as MerchantUpdate);
            }

            try {
                if (
                    merchant.kybInquiry &&
                    merchant.kybState !== KybState.finished &&
                    merchant.kybState !== KybState.failed
                ) {
                    merchant = await syncKybState(merchant, prisma);
                } else if (merchant.kybState === KybState.finished) {
                    merchant = await contingentlyHandleAppConfigure(merchant, axios, prisma);
                }
            } catch (error) {
                // it's unlikely that this will throw but we should catch and record all errors underneath this, merchant will get blocked elsewhere
                // we don't need to error out here because a new merchant shouldn't have a kyb inquiry but if they do
                console.log('error with kyb');

                Sentry.captureException(error);
                await Sentry.flush(2000);
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
