import { APIGatewayProxyResultV2 } from 'aws-lambda';
import {
    ErrorResponseUseCase,
    HandlerCoreFunctionUseCaseInterface,
    HandlerErrorUseCase,
    HandlerTaskChain,
    InputValidationUseCase,
    ParseAndValidateUseCase,
} from '../use-cases-and-task-chain.wip.js';
import { Merchant, PaymentRecord, PrismaClient, RefundRecord } from '@prisma/client';
import axios from 'axios';
import {
    ShopifyPaymentInitiation,
    parseAndValidateShopifyPaymentInitiation,
} from '../../models/shopify/process-payment-request.model.js';
import {
    ShopifyRequestHeaders,
    parseAndValidateShopifyRequestHeaders,
} from '../../models/shopify/shopify-request-headers.model.js';
import { PaymentRecordService } from '../../services/database/payment-record-service.database.service.js';
import { MerchantService } from '../../services/database/merchant-service.database.service.js';
import { MissingEnvError } from '../../errors/missing-env.error.js';
import { MissingExpectedDatabaseRecordError } from '../../errors/missing-expected-database-record.error.js';
import { DatabaseAccessError } from '../../errors/database-access.error.js';
import { convertAmountAndCurrencyToUsdcSize } from '../../services/coin-gecko.service.js';
import { generatePubkeyString } from '../../utilities/pubkeys.utility.js';
import {
    ShopifyRefundInitiation,
    parseAndValidateShopifyRefundInitiation,
} from '../../models/shopify/process-refund.request.model.js';
import { RefundRecordService } from '../../services/database/refund-record-service.database.service.js';
import { createErrorResponse } from '../../utilities/responses/error-response.utility.js';

export const shopifyRefundCoreUseCaseMethod = async (
    header: ShopifyRequestHeaders,
    body: ShopifyRefundInitiation,
    _: {},
    dependencies: { prisma: PrismaClient }
): Promise<APIGatewayProxyResultV2> => {
    const refundRecordService = new RefundRecordService(dependencies.prisma);
    const merchantService = new MerchantService(dependencies.prisma);
    let merchant: Merchant | null;

    // We don't need this here
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

    // This could just be the dependency
    let refundRecord: RefundRecord | null;

    try {
        refundRecord = await refundRecordService.getRefundRecord({
            shopId: body.id,
        });
    } catch (error) {
        throw new DatabaseAccessError('payment record');
    }

    // We do need this
    try {
        if (refundRecord == null) {
            let usdcSize: number;

            if (body.test) {
                usdcSize = 0.000001;
            } else {
                usdcSize = await convertAmountAndCurrencyToUsdcSize(body.amount, body.currency);
            }

            const newRefundRecordId = await generatePubkeyString();
            refundRecord = await refundRecordService.createRefundRecord(newRefundRecordId, body, merchant, usdcSize);
        }
    } catch (error) {
        throw new Error('Error creating payment record');
    }

    // this part is different betweent the two
    return {
        statusCode: 201,
        body: JSON.stringify({}),
    };
};

export class CreateShopifyRecordUseCase<ShopifyRecordInitiation>
    implements
        HandlerCoreFunctionUseCaseInterface<
            ShopifyRequestHeaders,
            ShopifyRecordInitiation,
            {},
            Promise<APIGatewayProxyResultV2>
        >
{
    constructor(prisma: PrismaClient) {}

    async coreFunction(
        header: ShopifyRequestHeaders,
        body: ShopifyRecordInitiation,
        queryParameter: {}
    ): Promise<APIGatewayProxyResultV2> {
        return await this.createShopifyRecord(header, body, queryParameter);
    }

    private createShopifyRecord = async (
        header: ShopifyRequestHeaders,
        body: ShopifyRecordInitiation,
        queryParameter: {}
    ): Promise<APIGatewayProxyResultV2> => {
        return {
            statusCode: 200,
            body: JSON.stringify({}),
        };
    };
}

export const shopifyRefundTaskChain = (): HandlerTaskChain<
    ShopifyRequestHeaders,
    ShopifyRefundInitiation,
    {},
    APIGatewayProxyResultV2,
    { prisma: PrismaClient }
> => {
    const headerUseCase = new ParseAndValidateUseCase(parseAndValidateShopifyRequestHeaders);
    const bodyUseCase = new ParseAndValidateUseCase((body: string) =>
        parseAndValidateShopifyRefundInitiation(JSON.parse(body))
    );
    const parameterUseCase = new ParseAndValidateUseCase(() => ({}));
    const inputUseCase = new InputValidationUseCase(headerUseCase, bodyUseCase, parameterUseCase);

    const prisma = new PrismaClient();
    const createShopifyRecordUseCase = new CreateShopifyRecordUseCase<ShopifyRefundInitiation>(prisma);
    const errorResponseUseCase = new ErrorResponseUseCase(createErrorResponse);
    const handlerErrorUseCase = new HandlerErrorUseCase(errorResponseUseCase);

    const taskChain = new HandlerTaskChain(inputUseCase, createShopifyRecordUseCase, handlerErrorUseCase);
    return taskChain;
};
