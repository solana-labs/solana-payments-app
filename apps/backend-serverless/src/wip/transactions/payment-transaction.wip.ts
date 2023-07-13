import { PrismaClient } from '@prisma/client';
import { APIGatewayProxyResultV2 } from 'aws-lambda';
import axios from 'axios';
import {
    TransactionRequestBody,
    parseAndValidateTransactionRequestBody,
} from '../../models/transaction-requests/transaction-request-body.model.js';
import { PaymentRecordService } from '../../services/database/payment-record-service.database.service.js';
import { TrmService } from '../../services/trm-service.service.js';
import { createErrorResponse } from '../../utilities/responses/error-response.utility.js';
import {
    ErrorResponseUseCase,
    HandlerErrorUseCase,
    HandlerTaskChain,
    InputValidationUseCase,
    ParseAndValidateUseCase,
} from '../use-cases-and-task-chain.wip.js';

export const paymentTransactionTaskChain = (): HandlerTaskChain<
    {},
    TransactionRequestBody,
    TransactionRequestParameters,
    APIGatewayProxyResultV2,
    { prisma: PrismaClient; axiosInstance: typeof axios }
> => {
    const headerUseCase = new ParseAndValidateUseCase(() => ({}));
    const bodyUseCase = new ParseAndValidateUseCase((body: string) =>
        parseAndValidateTransactionRequestBody(JSON.parse(body))
    );
    const parameterUseCase = new ParseAndValidateUseCase(parseAndValidatePaymentTransactionRequest);
    const inputUseCase = new InputValidationUseCase(headerUseCase, bodyUseCase, parameterUseCase);

    const prisma = new PrismaClient();
    const trm = new TrmService();

    const paymentRecordService = new PaymentRecordService(prisma);

    const createTransactionUseCase = new CreateTransactionUseCase(paymentRecordService, prisma, trm, axios);

    const errorResponseUseCase = new ErrorResponseUseCase(createErrorResponse);
    const handlerErrorUseCase = new HandlerErrorUseCase(errorResponseUseCase);

    const taskChain = new HandlerTaskChain(inputUseCase, createTransactionUseCase, handlerErrorUseCase);
    return taskChain;
};
