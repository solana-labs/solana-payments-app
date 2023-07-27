import { PrismaClient } from '@prisma/client';
import * as Sentry from '@sentry/serverless';
import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import axios from 'axios';
import { InvalidInputError } from '../../errors/invalid-input.error.js';
import { MissingEnvError } from '../../errors/missing-env.error.js';
import { parseAndValidateShopifyPaymentInitiation } from '../../models/shopify/process-payment-request.model.js';
import { parseAndValidateShopifyRequestHeaders } from '../../models/shopify/shopify-request-headers.model.js';
import { convertAmountAndCurrencyToUsdcSize } from '../../services/coin-gecko.service.js';
import { MerchantService } from '../../services/database/merchant-service.database.service.js';
import { PaymentRecordService } from '../../services/database/payment-record-service.database.service.js';
import { fetchCheckoutData } from '../../services/shopify/checkout-data.service.js';
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
            message: 'In Payment shopify handler',
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

            Sentry.captureEvent({
                message: 'In Payment SHOPIFY about to get the checkout response',
                level: 'info',
                extra: {
                    event,
                },
            });
            console.log(
                'paymentInitiation.payment_method.data.cancel_url',
                paymentInitiation.payment_method.data.cancel_url
            );
            let checkoutUrlParts = paymentInitiation.payment_method.data.cancel_url.split('/');
            console.log('parts', checkoutUrlParts);

            let checkoutId = checkoutUrlParts[checkoutUrlParts.length - 2];
            console.log('checkoutId', checkoutId);
            try {
                let checkoutResponse = await fetchCheckoutData(merchant, checkoutId);

                console.log('checkout data?', checkoutResponse);
                Sentry.captureEvent({
                    message: 'In Payment SHOPIFY WE GOT ITTT',
                    level: 'info',
                    extra: {
                        event,
                        checkoutResponse,
                    },
                });
            } catch (error) {
                console.log('checkout response 1', error);
            }

            try {
                let checkoutResponse2 = await fetchCheckoutData(merchant, checkoutId.slice(3));
                console.log('checkout data?', checkoutResponse2);
                Sentry.captureEvent({
                    message: 'In Payment SHOPIFY WE GOT ITTT2',
                    level: 'info',
                    extra: {
                        event,
                        checkoutResponse2,
                    },
                });
            } catch (error) {
                console.log('checkout response 2', error);
            }

            Sentry.captureEvent({
                message: 'postmortem',
                level: 'info',
            });

            let paymentRecord;
            try {
                paymentRecord = await paymentRecordService.getPaymentRecord({ shopId: paymentInitiation.id });
            } catch {
                let usdcSize: number;
                if (paymentInitiation.test) {
                    usdcSize = 0.01;
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
