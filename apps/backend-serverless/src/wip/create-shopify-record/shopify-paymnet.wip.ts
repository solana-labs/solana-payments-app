import { APIGatewayProxyResultV2 } from 'aws-lambda';
import {
    ErrorResponseUseCase,
    HandlerErrorUseCase,
    HandlerTaskChain,
    InputValidationUseCase,
    ParseAndValidateUseCase,
} from '../use-cases-and-task-chain.wip.js';
import { Merchant, PaymentRecord, PrismaClient } from '@prisma/client';
import axios from 'axios';
import {
    ShopifyPaymentInitiation,
    parseAndValidateShopifyPaymentInitiation,
} from '../../models/shopify/process-payment-request.model.js';
import {
    ShopifyRequestHeaders,
    parseAndValidateShopifyRequestHeaders,
} from '../../models/shopify/shopify-request-headers.model.js';
import { parseAndValidatePaymentTransactionRequest } from '../../models/transaction-requests/payment-transaction-request-parameters.model.js';
import { PaymentRecordService } from '../../services/database/payment-record-service.database.service.js';
import { MerchantService } from '../../services/database/merchant-service.database.service.js';
import {
    ErrorMessage,
    ErrorType,
    createErrorResponse,
    errorResponse,
} from '../../utilities/responses/error-response.utility.js';
import { MissingEnvError } from '../../errors/missing-env.error.js';
import { MissingExpectedDatabaseRecordError } from '../../errors/missing-expected-database-record.error.js';
import { DatabaseAccessError } from '../../errors/database-access.error.js';
import { convertAmountAndCurrencyToUsdcSize } from '../../services/coin-gecko.service.js';
import { generatePubkeyString } from '../../utilities/pubkeys.utility.js';
import { CreateShopifyRecordUseCase } from './shopify-refund.wip.js';

export const shopifyPaymentCoreUseCaseMethod = async (
    header: ShopifyRequestHeaders,
    body: ShopifyPaymentInitiation,
    _: {},
    dependencies: { prisma: PrismaClient }
): Promise<APIGatewayProxyResultV2> => {
    const paymentRecordService = new PaymentRecordService(dependencies.prisma);
    const merchantService = new MerchantService(dependencies.prisma);
    let merchant: Merchant | null;
    const paymentUiUrl = process.env.PAYMENT_UI_URL;

    if (paymentUiUrl == null) {
        throw new MissingEnvError('payment ui url');
    }

    const shop = header['shopify-shop-domain'];

    try {
        merchant = await merchantService.getMerchant({ shop: shop });
    } catch (error) {
        throw new MissingExpectedDatabaseRecordError('merchant');
    }

    if (merchant == null) {
        throw new MissingExpectedDatabaseRecordError('merchant');
    }

    let paymentRecord: PaymentRecord | null;

    try {
        paymentRecord = await paymentRecordService.getPaymentRecord({
            shopId: body.id,
        });
    } catch (error) {
        throw new DatabaseAccessError('payment record');
    }

    try {
        if (paymentRecord == null) {
            let usdcSize: number;

            if (body.test) {
                usdcSize = 0.000001;
            } else {
                usdcSize = await convertAmountAndCurrencyToUsdcSize(body.amount, body.currency);
            }

            const newPaymentRecordId = await generatePubkeyString();
            paymentRecord = await paymentRecordService.createPaymentRecord(
                newPaymentRecordId,
                body,
                merchant,
                usdcSize
            );
        }
    } catch (error) {
        throw new Error('Error creating payment record');
    }

    return {
        statusCode: 201,
        body: JSON.stringify({
            redirect_url: `${paymentUiUrl}?paymentId=${paymentRecord.id}`,
        }),
    };
};

export const shopifyPaymentTaskChain = (): HandlerTaskChain<
    ShopifyRequestHeaders,
    ShopifyPaymentInitiation,
    {},
    APIGatewayProxyResultV2,
    { prisma: PrismaClient }
> => {
    const headerUseCase = new ParseAndValidateUseCase(parseAndValidateShopifyRequestHeaders);
    const bodyUseCase = new ParseAndValidateUseCase((body: string) =>
        parseAndValidateShopifyPaymentInitiation(JSON.parse(body))
    );
    const parameterUseCase = new ParseAndValidateUseCase(() => ({}));
    const inputUseCase = new InputValidationUseCase(headerUseCase, bodyUseCase, parameterUseCase);

    const prisma = new PrismaClient();
    const createShopifyRecordUseCase = new CreateShopifyRecordUseCase<ShopifyPaymentInitiation>(prisma);
    const errorResponseUseCase = new ErrorResponseUseCase(createErrorResponse);
    const handlerErrorUseCase = new HandlerErrorUseCase(errorResponseUseCase);

    const taskChain = new HandlerTaskChain(inputUseCase, createShopifyRecordUseCase, handlerErrorUseCase);
    return taskChain;
};
