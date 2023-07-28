import { PrismaClient } from '@prisma/client';
import * as Sentry from '@sentry/serverless';
import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { InvalidInputError } from '../../../../errors/invalid-input.error.js';
import { parseAndValidateUpdateLoyaltyRequestBody } from '../../../../models/clients/merchant-ui/update-loyalty-request.model.js';
import { MerchantService, TierUpdate } from '../../../../services/database/merchant-service.database.service.js';
import { withAuth } from '../../../../utilities/clients/merchant-ui/token-authenticate.utility.js';
import { filterUndefinedFields } from '../../../../utilities/database/filter-underfined-fields.utility.js';
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

        const merchantService = new MerchantService(prisma);
        if (event.body == null) {
            return createErrorResponse(new InvalidInputError('missing body in request'));
        }

        try {
            const merchantAuthToken = withAuth(event.cookies);
            let merchant = await merchantService.getMerchant({ id: merchantAuthToken.id });

            const updateLoyaltyRequest = parseAndValidateUpdateLoyaltyRequestBody(JSON.parse(event.body));

            let merchantUpdateQuery = {
                ...(updateLoyaltyRequest.loyaltyProgram && { loyaltyProgram: updateLoyaltyRequest.loyaltyProgram }),
                ...(updateLoyaltyRequest.points?.mint && { pointsMint: updateLoyaltyRequest.points.mint }),
                ...(updateLoyaltyRequest.points?.back && { pointsBack: updateLoyaltyRequest.points.back }),
            };

            Object.keys(merchantUpdateQuery).length > 0 &&
                (await merchantService.updateMerchant(merchant, merchantUpdateQuery));

            if (updateLoyaltyRequest.tiers && Object.keys(updateLoyaltyRequest.tiers).length != 0) {
                let tierDetails: TierUpdate;

                if (updateLoyaltyRequest.tiers.id) {
                    let fetchedTier = await merchantService.getTier(updateLoyaltyRequest.tiers.id);
                    tierDetails = {
                        ...(fetchedTier || {}),
                        ...filterUndefinedFields(updateLoyaltyRequest.tiers),
                    };
                } else {
                    tierDetails = updateLoyaltyRequest.tiers;
                }

                // if (
                //     !tierDetails.name ||
                //     !tierDetails.threshold ||
                //     !tierDetails.discount
                //     // !updateLoyaltyRequest.tiers.merchantAddress ||
                //     // !updateLoyaltyRequest.tiers.gasAddress
                // ) {
                //     throw new Error('Required tier details are missing');
                // }

                // let manageTierTransaction = await fetchManageTiersTransaction(
                //     tierDetails.name,
                //     tierDetails.threshold,
                //     tierDetails.discount,
                //     updateLoyaltyRequest.tiers.merchantAddress,
                //     updateLoyaltyRequest.tiers.gasAddress,
                //     tierDetails.mintAddress || undefined // Provide a default value or handle the error
                // );

                // Update or create the tiers in the database
                if (updateLoyaltyRequest.tiers.id) {
                    await merchantService.updateTier(tierDetails);
                } else {
                    await merchantService.createTier(merchant.id, tierDetails);
                }
            }

            if (updateLoyaltyRequest.products && Object.keys(updateLoyaltyRequest.products).length != 0) {
                await merchantService.toggleProduct(updateLoyaltyRequest.products);
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
