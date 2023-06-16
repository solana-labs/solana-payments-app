import * as Sentry from '@sentry/serverless';
import { APIGatewayProxyResultV2, SQSEvent } from 'aws-lambda';
import { startExecutionOfShopifyMutationRetry } from '../../../services/step-function/start-execution-shopify-retry.service.js';

Sentry.AWSLambda.init({
    dsn: process.env.SENTRY_DSN,
    tracesSampleRate: 1.0,
});

export const sqsMessageReceive = Sentry.AWSLambda.wrapHandler(
    async (event: SQSEvent): Promise<APIGatewayProxyResultV2> => {
        // TODO: Don't throw in the loop
        for (const record of event.Records) {
            console.log(record);
            const attributes = record.messageAttributes;

            if (attributes == null) {
                // Right now we are not likely to get here as we only have one type of message that should have attribites
                // Let's log and flag this as a critical error
                console.log('No attributes');
                throw new Error('No attributes');
            }

            const messageType = attributes['message-type'].stringValue;

            if (messageType == null) {
                // Right now we are not likely to get here as all of our messages should have a messageType attribute
                // Let's log and flag this as a critical error
                console.log('No message type');
                throw new Error('No message type');
            }

            if (messageType == 'shopify-mutation-retry') {
                try {
                    await startExecutionOfShopifyMutationRetry(record.body);
                } catch (error) {
                    // This would be an error with shopify step functions not being able to start
                    // Log and flag as a critical error
                    console.log(error);
                    throw new Error('Couldnt execute shopify mutation retry step function');
                }
            } else {
                // We have a messageType that we don't know how to handle
                // TODO: Log and flag as a critical error with sentry
                throw new Error('Unknown message type');
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
        rethrowAfterCapture: true,
    }
);
