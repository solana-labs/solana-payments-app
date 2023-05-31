import * as Sentry from '@sentry/serverless';
import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { parseAndValidateShopifyPaymentInitiation } from '../../models/shopify/process-payment-request.model.js';
import { requestErrorResponse } from '../../utilities/request-response.utility.js';
import { PrismaClient } from '@prisma/client';
import { PaymentRecordService } from '../../services/database/payment-record-service.database.service.js';
import { MerchantService } from '../../services/database/merchant-service.database.service.js';
import { convertAmountAndCurrencyToUsdcSize } from '../../services/coin-gecko.service.js';
import { generatePubkeyString } from '../../utilities/generate-pubkey.js';
import {
    ErrorMessage,
    ErrorType,
    errorResponse,
    errorTypeForError,
} from '../../utilities/responses/error-response.utility.js';

Sentry.AWSLambda.init({
    dsn: 'https://dbf74b8a0a0e4927b9269aa5792d356c@o4505168718004224.ingest.sentry.io/4505168722526208',
    tracesSampleRate: 1.0,
});

export const payment = Sentry.AWSLambda.wrapHandler(
    async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> => {
        const prisma = new PrismaClient();
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

        const merchant = await merchantService.getMerchant({ shop: shop });

        if (merchant == null) {
            return errorResponse(ErrorType.notFound, ErrorMessage.unknownMerchant);
        }

        let paymentInitiation;

        try {
            paymentInitiation = parseAndValidateShopifyPaymentInitiation(JSON.parse(event.body));
        } catch (error) {
            return errorResponse(ErrorType.badRequest, ErrorMessage.invalidRequestBody);
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
                return errorResponse(ErrorType.internalServerError, ErrorMessage.internalServerError);
            }
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
