import { PrismaClient } from '@prisma/client';
import { APIGatewayProxyResultV2 } from 'aws-lambda';
import {
    ShopifyPaymentInitiation,
    parseAndValidateShopifyPaymentInitiation,
} from '../../models/shopify/process-payment-request.model.js';
import {
    ShopifyRequestHeaders,
    parseAndValidateShopifyRequestHeaders,
} from '../../models/shopify/shopify-request-headers.model.js';
import { createErrorResponse } from '../../utilities/responses/error-response.utility.js';
import {
    ErrorResponseUseCase,
    HandlerErrorUseCase,
    HandlerTaskChain,
    InputValidationUseCase,
    ParseAndValidateUseCase,
} from '../use-cases-and-task-chain.wip.js';
import { CreateShopifyRecordUseCase } from './shopify-refund.wip.js';

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
