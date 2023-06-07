import * as Sentry from '@sentry/serverless';
import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import {
    ShopifyPaymentInitiation,
    parseAndValidateShopifyPaymentInitiation,
} from '../../models/shopify/process-payment-request.model.js';
import { requestErrorResponse } from '../../utilities/responses/request-response.utility.js';
import { Merchant, PaymentRecord, PrismaClient } from '@prisma/client';
import { PaymentRecordService } from '../../services/database/payment-record-service.database.service.js';
import { MerchantService } from '../../services/database/merchant-service.database.service.js';
import { generatePubkeyString } from '../../utilities/pubkeys.utility.js';
import { ErrorMessage, ErrorType, errorResponse } from '../../utilities/responses/error-response.utility.js';

const prisma = new PrismaClient();

Sentry.AWSLambda.init({
    dsn: process.env.SENTRY_DSN,
    tracesSampleRate: 1.0,
    integrations: [new Sentry.Integrations.Prisma({ client: prisma })],
});

export const payment = Sentry.AWSLambda.wrapHandler(
    async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> => {
        const paymentRecordService = new PaymentRecordService(prisma);
        const merchantService = new MerchantService(prisma);
        const paymentUiUrl = process.env.PAYMENT_UI_URL;

        if (paymentUiUrl == null) {
            return errorResponse(ErrorType.internalServerError, ErrorMessage.missingEnv);
        }

        if (event.body == null) {
            return errorResponse(ErrorType.badRequest, ErrorMessage.missingBody);
        }

        const shop = event.headers['shopify-shop-domain'];

        if (shop == null) {
            return errorResponse(ErrorType.badRequest, ErrorMessage.missingHeader);
        }

        let merchant: Merchant | null;

        try {
            merchant = await merchantService.getMerchant({ shop: shop });
        } catch (error) {
            return errorResponse(ErrorType.internalServerError, ErrorMessage.databaseAccessError);
        }

        if (merchant == null) {
            return errorResponse(ErrorType.notFound, ErrorMessage.unknownMerchant);
        }

        let paymentInitiation: ShopifyPaymentInitiation;

        try {
            paymentInitiation = parseAndValidateShopifyPaymentInitiation(JSON.parse(event.body));
        } catch (error) {
            // TODO: Correct error response
            return requestErrorResponse(error);
        }

        let paymentRecord: PaymentRecord | null;

        try {
            paymentRecord = await paymentRecordService.getPaymentRecord({
                shopId: paymentInitiation.id,
            });
        } catch (error) {
            return errorResponse(ErrorType.internalServerError, ErrorMessage.databaseAccessError);
        }

        try {
            if (paymentRecord == null) {
                let usdcSize: number;

                if (paymentInitiation.test) {
                    usdcSize = 0.000001;
                } else {
                    // TODO: We had a bug here, figure it out and fix it, for now, setting to 0.0001
                    // usdcSize = await convertAmountAndCurrencyToUsdcSize(
                    //     paymentInitiation.amount,
                    //     paymentInitiation.currency
                    // );
                    usdcSize = 0.000001;
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
            return errorResponse(ErrorType.internalServerError, ErrorMessage.incompatibleDatabaseRecords);
        }

        return {
            statusCode: 201,
            body: JSON.stringify({
                redirect_url: `${paymentUiUrl}?paymentId=${paymentRecord.id}`,
            }),
        };
    },
    {
        rethrowAfterCapture: true,
    }
);
