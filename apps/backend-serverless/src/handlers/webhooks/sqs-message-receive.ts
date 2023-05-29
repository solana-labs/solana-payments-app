import * as Sentry from '@sentry/serverless';
import { APIGatewayProxyResultV2, SQSEvent } from 'aws-lambda';
import { startExecutionOfShopifyMutationRetry } from '../../services/step-function/start-execution-shopify-retry.service.js';

Sentry.AWSLambda.init({
    dsn: 'https://dbf74b8a0a0e4927b9269aa5792d356c@o4505168718004224.ingest.sentry.io/4505168722526208',
    tracesSampleRate: 1.0,
});

export const sqsMessageReceive = Sentry.AWSLambda.wrapHandler(
    async (event: SQSEvent): Promise<APIGatewayProxyResultV2> => {
        for (const record of event.Records) {
            console.log(record);
            try {
                const attributes = record.messageAttributes;

                console.log('attributes');
                console.log(attributes);

                if (attributes == null) {
                    console.log('No attributes');
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
                        console.log('Couldnt execute');
                        console.log(error);
                    }
                }
            } catch (err) {
                // TODO: Log with sentry
                // Here will can receive errors about the make up of the message itself or errors for using the message to
                // start the execution of a step function. We should log these errors and flag them as critical errors
                console.log(err);
                continue;
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
