import { Merchant, PrismaClient, RefundRecord } from '@prisma/client';
import * as Sentry from '@sentry/serverless';
import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import axios from 'axios';
import { InvalidInputError } from '../../errors/invalid-input.error.js';
import { MissingExpectedDatabaseRecordError } from '../../errors/missing-expected-database-record.error.js';
import {
    ShopifyRefundInitiation,
    parseAndValidateShopifyRefundInitiation,
} from '../../models/shopify/process-refund.request.model.js';
import { convertAmountAndCurrencyToUsdcSize } from '../../services/coin-gecko.service.js';
import { MerchantService } from '../../services/database/merchant-service.database.service.js';
import { RefundRecordService } from '../../services/database/refund-record-service.database.service.js';
import { generatePubkeyString } from '../../utilities/pubkeys.utility.js';
import { createErrorResponse } from '../../utilities/responses/error-response.utility.js';

const prisma = new PrismaClient();

Sentry.AWSLambda.init({
    dsn: process.env.SENTRY_DSN,
    tracesSampleRate: 1.0,
    integrations: [new Sentry.Integrations.Prisma({ client: prisma })],
});

export const refund = Sentry.AWSLambda.wrapHandler(
    async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> => {
        Sentry.captureEvent({
            message: 'In refund',
            level: 'info',
            extra: {
                event,
            },
        });

        const prisma = new PrismaClient();
        const refundRecordService = new RefundRecordService(prisma);
        const merchantService = new MerchantService(prisma);

        if (event.body == null) {
            return createErrorResponse(new InvalidInputError('request body'));
        }

        const shop = event.headers['shopify-shop-domain'];

        if (shop == null) {
            return createErrorResponse(new InvalidInputError('shopify domain header'));
        }

        let merchant: Merchant | null;

        try {
            merchant = await merchantService.getMerchant({ shop: shop });
        } catch (error) {
            return createErrorResponse(error);
        }

        if (merchant == null) {
            return createErrorResponse(new MissingExpectedDatabaseRecordError('merchant'));
        }

        let refundInitiation: ShopifyRefundInitiation;
        try {
            refundInitiation = parseAndValidateShopifyRefundInitiation(JSON.parse(event.body));
        } catch (error) {
            return createErrorResponse(error);
        }

        let refundRecord: RefundRecord | null;

        try {
            refundRecord = await refundRecordService.getRefundRecord({
                shopId: refundInitiation.id,
            });
        } catch (error) {
            return createErrorResponse(error);
        }

        try {
            if (refundRecord == null) {
                let usdcSize: number;

                if (refundInitiation.test) {
                    usdcSize = 0;
                } else {
                    usdcSize = await convertAmountAndCurrencyToUsdcSize(
                        refundInitiation.amount,
                        refundInitiation.currency,
                        axios
                    );
                }

                const newRefundRecordId = await generatePubkeyString();
                refundRecord = await refundRecordService.createRefundRecord(
                    newRefundRecordId,
                    refundInitiation,
                    merchant,
                    usdcSize
                );
            }
        } catch (error) {
            return createErrorResponse(error);
        }

        // We return 201 status code here per shopify's documentation:: https://shopify.dev/docs/apps/payments/implementation/process-a-refund#initiate-the-flow
        return {
            statusCode: 201,
            body: JSON.stringify({}),
        };
    },
    {
        rethrowAfterCapture: false,
    }
);
