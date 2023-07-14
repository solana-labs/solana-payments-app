import * as Sentry from '@sentry/serverless';
import { APIGatewayProxyResultV2, SQSEvent } from 'aws-lambda';
import { InvalidInputError } from '../../../errors/invalid-input.error.js';
import { startExecutionOfShopifyMutationRetry } from '../../../services/step-function/start-execution-shopify-retry.service.js';
import { createErrorResponse } from '../../../utilities/responses/error-response.utility.js';

Sentry.AWSLambda.init({
    dsn: process.env.SENTRY_DSN,
    tracesSampleRate: 1.0,
});

export const sqsMessageReceive = Sentry.AWSLambda.wrapHandler(
    async (event: SQSEvent): Promise<APIGatewayProxyResultV2> => {
        Sentry.captureEvent({
            message: 'in sqs message receive',
            level: 'info',
        });
        // Theses queues are set t
        for (const record of event.Records) {
            const attributes = record.messageAttributes;

            if (attributes == null) {
                // Right now we are not likely to get here as we only have one type of message that should have attribites
                // Let's log and flag this as a critical error
                return createErrorResponse(new Error('No Attributes'));
            }

            const messageType = attributes['message-type'].stringValue;

            if (messageType == null) {
                // Right now we are not likely to get here as all of our messages should have a messageType attribute
                // Let's log and flag this as a critical error
                return createErrorResponse(new Error('No message type'));
            }

            if (messageType == 'shopify-mutation-retry') {
                try {
                    await startExecutionOfShopifyMutationRetry(record.body);
                } catch (error) {
                    return createErrorResponse(new Error('Could not execute shopify mutation retry step function'));
                }
            } else {
                return createErrorResponse(new InvalidInputError('Unknown Message Type' + messageType));
            }
        }

        return {
            statusCode: 200,
            body: JSON.stringify({
                message: 'Successfully started step function',
            }),
        };
    },
    {
        rethrowAfterCapture: false,
    }
);
