import * as Sentry from '@sentry/serverless';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { parseAndValidateShopifyPaymentInitiation } from '../../models/process-payment-request.model.js';
import { requestErrorResponse } from '../../utilities/request-response.utility.js';
import { PrismaClient } from '@prisma/client';
import { PaymentRecordService } from '../../services/database/payment-record-service.database.service.js';
import { MerchantService } from '../../services/database/merchant-service.database.service.js';
import { convertAmountAndCurrencyToUsdcSize } from '../../services/coin-gecko.service.js';
import { generatePubkeyString } from '../../utilities/generate-pubkey.js';

Sentry.AWSLambda.init({
    dsn: 'https://dbf74b8a0a0e4927b9269aa5792d356c@o4505168718004224.ingest.sentry.io/4505168722526208',
    tracesSampleRate: 1.0,
});

export const payment = Sentry.AWSLambda.wrapHandler(
    async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
        const prisma = new PrismaClient();
        const paymentRecordService = new PaymentRecordService(prisma);
        const merchantService = new MerchantService(prisma);
        const paymentUiUrl = process.env.PAYMENT_UI_URL;

        if (paymentUiUrl == null) {
            return requestErrorResponse(new Error('Missing internal config.'));
        }

        if (event.body == null) {
            return requestErrorResponse(new Error('Missing body.'));
        }

        const shop = event.headers['shopify-shop-domain'];

        if (shop == null) {
            return requestErrorResponse(new Error('Missing shop.'));
        }

        const merchant = await merchantService.getMerchant({ shop: shop });

        if (merchant == null) {
            throw new Error('Merchant not found');
        }

        let paymentInitiation;
        try {
            paymentInitiation = parseAndValidateShopifyPaymentInitiation(JSON.parse(event.body));
        } catch (error) {
            return requestErrorResponse(error);
        }

        let paymentRecord = await paymentRecordService.getPaymentRecord({
            shopId: paymentInitiation.id,
        });

        if (paymentRecord == null) {
            try {
                const usdcSize = await convertAmountAndCurrencyToUsdcSize(
                    paymentInitiation.amount,
                    paymentInitiation.currency
                );
                const newPaymentRecordId = await generatePubkeyString();
                paymentRecord = await paymentRecordService.createPaymentRecord(
                    newPaymentRecordId,
                    paymentInitiation,
                    merchant,
                    usdcSize
                );
            } catch (error) {
                return requestErrorResponse(error);
            }
        }

        return {
            statusCode: 200,
            body: JSON.stringify({
                redirect_url: `${paymentUiUrl}?paymentId=${paymentRecord.id}`,
            }),
        };
    },
    {
        rethrowAfterCapture: true,
    }
);
