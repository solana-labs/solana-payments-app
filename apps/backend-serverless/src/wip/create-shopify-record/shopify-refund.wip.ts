import { PrismaClient } from '@prisma/client';
import { APIGatewayProxyResultV2 } from 'aws-lambda';
import {
    ShopifyRefundInitiation,
    parseAndValidateShopifyRefundInitiation,
} from '../../models/shopify/process-refund.request.model.js';
import {
    ShopifyRequestHeaders,
    parseAndValidateShopifyRequestHeaders,
} from '../../models/shopify/shopify-request-headers.model.js';
import { createErrorResponse } from '../../utilities/responses/error-response.utility.js';
import {
    ErrorResponseUseCase,
    HandlerCoreFunctionUseCaseInterface,
    HandlerErrorUseCase,
    HandlerTaskChain,
    InputValidationUseCase,
    ParseAndValidateUseCase,
} from '../use-cases-and-task-chain.wip.js';

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
