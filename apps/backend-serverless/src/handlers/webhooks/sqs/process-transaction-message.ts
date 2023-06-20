import * as Sentry from '@sentry/serverless';
import { APIGatewayProxyResultV2, SQSEvent } from 'aws-lambda';
import { startExecutionOfShopifyMutationRetry } from '../../../services/step-function/start-execution-shopify-retry.service.js';
import {
    ProcessTransactionMessage,
    parseAndValidateProcessTransactionMessage,
} from '../../../models/sqs/process-transaction-message.model.js';
import { WebSocketService } from '../../../services/websocket/send-websocket-message.service.js';
import { MissingEnvError } from '../../../errors/missing-env.error.js';
import { createErrorResponse } from '../../../utilities/responses/error-response.utility.js';
import { PaymentRecordService } from '../../../services/database/payment-record-service.database.service.js';
import { PrismaClient } from '@prisma/client';
import { processTransaction } from '../../../services/business-logic/process-transaction.service.js';
import axios from 'axios';

const prisma = new PrismaClient();

Sentry.AWSLambda.init({
    dsn: process.env.SENTRY_DSN,
    tracesSampleRate: 1.0,
    integrations: [new Sentry.Integrations.Prisma({ client: prisma })],
});

export const processTransactionMessage = Sentry.AWSLambda.wrapHandler(
    async (event: SQSEvent): Promise<APIGatewayProxyResultV2> => {
        const websocketUrl = process.env.WEBSOCKET_URL;

        const paymentRecordService = new PaymentRecordService(prisma);

        if (websocketUrl == null) {
            const error = new MissingEnvError('websocket url');
            Sentry.captureException(error);
            return createErrorResponse(new MissingEnvError('websocket url'));
        }

        let failedProcessingRecords: ProcessTransactionMessage[] = [];

        // We have this configured for a batch of one, we look just in case but this should only return once
        for (const record of event.Records) {
            console.log(record);

            const processTransactionMessageBody = JSON.parse(record.body);

            let processTransactionMessage: ProcessTransactionMessage;

            try {
                processTransactionMessage = parseAndValidateProcessTransactionMessage(processTransactionMessageBody);
            } catch (error) {
                console.log(error);
                Sentry.captureException(error);
                failedProcessingRecords.push(processTransactionMessageBody);
                // How can we make this single one retry? We can set the batch to 0 so this doesnt happen for now.
                continue;
            }

            const websocketService = new WebSocketService(
                websocketUrl,
                {
                    signatures: [processTransactionMessage.signature],
                },
                paymentRecordService
            );

            try {
                await processTransaction(processTransactionMessage.signature, prisma, websocketService, axios);
            } catch (error) {
                Sentry.captureException(error);
                await websocketService.sendFailedProcessingTransactionMessage();
            }
        }

        return {
            statusCode: 200,
            body: JSON.stringify({
                message: 'Successfully process transaction.',
            }),
        };
    },
    {
        rethrowAfterCapture: false,
    }
);
