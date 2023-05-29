import * as Sentry from '@sentry/serverless';
import { APIGatewayProxyResultV2, SQSEvent } from 'aws-lambda';
import { requestErrorResponse } from '../../utilities/request-response.utility.js';
import { error } from 'console';
import { ErrorMessage, ErrorType, errorResponse } from '../../utilities/responses/error-response.utility.js';
import { startExecutionOfShopifyMutationRetry } from '../../services/step-function/start-execution-shopify-retry.service.js';

Sentry.AWSLambda.init({
    dsn: 'https://dbf74b8a0a0e4927b9269aa5792d356c@o4505168718004224.ingest.sentry.io/4505168722526208',
    tracesSampleRate: 1.0,
});

// TODO: I hate this but idk why, gonna move on for now
export const sqsMessageReceive = Sentry.AWSLambda.wrapHandler(
    async (event: SQSEvent): Promise<APIGatewayProxyResultV2> => {
        for (const record of event.Records) {
            try {
                const attributes = record.messageAttributes;

                if (attributes == null) {
                    throw new Error('No attributes');
                }

                const messageType = attributes['message-type'].stringValue;

                if (messageType == null) {
                    throw new Error('No message type');
                }

                if (messageType == 'shopify-mutation-retry') {
                    try {
                        await startExecutionOfShopifyMutationRetry(record.body);
                    } catch (error) {
                        console.log(error);
                    }
                }
            } catch (err) {
                // TODO: Log with sentry
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
