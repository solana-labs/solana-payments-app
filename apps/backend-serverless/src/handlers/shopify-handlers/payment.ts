import { Merchant, PaymentRecord, PrismaClient } from '@prisma/client';
import * as Sentry from '@sentry/serverless';
import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import axios from 'axios';
import { InvalidInputError } from '../../errors/invalid-input.error.js';
import { MissingEnvError } from '../../errors/missing-env.error.js';
import { MissingExpectedDatabaseRecordError } from '../../errors/missing-expected-database-record.error.js';
import {
    ShopifyPaymentInitiation,
    parseAndValidateShopifyPaymentInitiation,
} from '../../models/shopify/process-payment-request.model.js';
import {
    ShopifyRequestHeaders,
    parseAndValidateShopifyRequestHeaders,
} from '../../models/shopify/shopify-request-headers.model.js';
import { convertAmountAndCurrencyToUsdcSize } from '../../services/coin-gecko.service.js';
import { MerchantService } from '../../services/database/merchant-service.database.service.js';
import { PaymentRecordService } from '../../services/database/payment-record-service.database.service.js';
import { generatePubkeyString } from '../../utilities/pubkeys.utility.js';
import { createErrorResponse } from '../../utilities/responses/error-response.utility.js';

const prisma = new PrismaClient();

Sentry.AWSLambda.init({
    dsn: process.env.SENTRY_DSN,
    tracesSampleRate: 1.0,
    integrations: [new Sentry.Integrations.Prisma({ client: prisma })],
});

export const payment = Sentry.AWSLambda.wrapHandler(
    async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> => {
        Sentry.captureEvent({
            message: 'In Payment',
            level: 'info',
            extra: {
                event,
                parsed: JSON.parse(event),
            },
        });

        const paymentRecordService = new PaymentRecordService(prisma);
        const merchantService = new MerchantService(prisma);
        const paymentUiUrl = process.env.PAYMENT_UI_URL;

        if (paymentUiUrl == null) {
            return createErrorResponse(new MissingEnvError('payment ui url'));
        }

        if (event.body == null) {
            return createErrorResponse(new InvalidInputError('request body'));
        }

        let shopifyHeader: ShopifyRequestHeaders;
        try {
            shopifyHeader = parseAndValidateShopifyRequestHeaders(event.headers);
        } catch (error) {
            console.log(error);
            Sentry.captureException(error);
            return createErrorResponse(error);
        }

        const shop = shopifyHeader['shopify-shop-domain'];

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

        let paymentInitiation: ShopifyPaymentInitiation;

        console.log('about to parse, but checking test', JSON.parse(event.body).test);
        try {
            paymentInitiation = parseAndValidateShopifyPaymentInitiation(JSON.parse(event.body));
        } catch (error) {
            return createErrorResponse(error);
        }

        let paymentRecord: PaymentRecord | null;

        try {
            paymentRecord = await paymentRecordService.getPaymentRecord({
                shopId: paymentInitiation.id,
            });
        } catch (error) {
            return createErrorResponse(error);
        }

        try {
            if (paymentRecord == null) {
                let usdcSize: number;
                console.log('test?', paymentInitiation.test);
                if (paymentInitiation.test) {
                    usdcSize = 0;
                } else {
                    usdcSize = await convertAmountAndCurrencyToUsdcSize(
                        paymentInitiation.amount,
                        paymentInitiation.currency,
                        axios
                    );
                }

                const newPaymentRecordId = await generatePubkeyString();
                paymentRecord = await paymentRecordService.createPaymentRecord(
                    newPaymentRecordId,
                    paymentInitiation,
                    merchant,
                    usdcSize
                );
            }
        } catch (error) {
            return createErrorResponse(error);
        }

        return {
            statusCode: 201,
            body: JSON.stringify({
                redirect_url: `${paymentUiUrl}?paymentId=${paymentRecord.id}`,
            }),
        };
    },
    {
        rethrowAfterCapture: false,
    }
);
