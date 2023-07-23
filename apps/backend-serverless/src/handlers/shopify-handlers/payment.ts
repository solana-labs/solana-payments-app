import { PrismaClient } from '@prisma/client';
import * as Sentry from '@sentry/serverless';
import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import axios from 'axios';
import { InvalidInputError } from '../../errors/invalid-input.error';
import { MissingEnvError } from '../../errors/missing-env.error';
import { parseAndValidateShopifyPaymentInitiation } from '../../models/shopify/process-payment-request.model';
import { parseAndValidateShopifyRequestHeaders } from '../../models/shopify/shopify-request-headers.model';
import { convertAmountAndCurrencyToUsdcSize } from '../../services/coin-gecko.service';
import { MerchantService } from '../../services/database/merchant-service.database.service';
import { PaymentRecordService } from '../../services/database/payment-record-service.database.service';
import { generatePubkeyString } from '../../utilities/pubkeys.utility';
import { createErrorResponse } from '../../utilities/responses/error-response.utility';

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

        try {
            const shopifyHeader = parseAndValidateShopifyRequestHeaders(event.headers);
            const shop = shopifyHeader['shopify-shop-domain'];
            if (shop == null) {
                throw new InvalidInputError('shopify domain header');
            }
            const merchant = await merchantService.getMerchant({ shop: shop });
            const paymentInitiation = parseAndValidateShopifyPaymentInitiation(JSON.parse(event.body));

            let paymentRecord;
            try {
                paymentRecord = await paymentRecordService.getPaymentRecord({ shopId: paymentInitiation.id });
            } catch {
                let usdcSize: number;
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

            return {
                statusCode: 201,
                body: JSON.stringify({
                    redirect_url: `${paymentUiUrl}/${paymentRecord.id}`,
                }),
            };
        } catch (error) {
            return createErrorResponse(error);
        }
    },
    {
        rethrowAfterCapture: false,
    }
);
