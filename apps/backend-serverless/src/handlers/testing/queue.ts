import * as Sentry from '@sentry/serverless';
import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import pkg from 'aws-sdk';
const { SQS } = pkg;
import { requestErrorResponse } from '../../utilities/request-response.utility.js';

Sentry.AWSLambda.init({
    dsn: 'https://dbf74b8a0a0e4927b9269aa5792d356c@o4505168718004224.ingest.sentry.io/4505168722526208',
    tracesSampleRate: 1.0,
});

// TODO: read the message from the queue
export const queue = Sentry.AWSLambda.wrapHandler(
    async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> => {
        const queueUrl = process.env.AWS_SHOPIFY_MUTATION_QUEUE_URL;

        if (queueUrl == null) {
            return requestErrorResponse(new Error('AWS_SHOPIFY_MUTATION_QUEUE_URL is not defined'));
        }

        const sqs = new SQS();

        try {
            await sqs
                .sendMessage({
                    QueueUrl: queueUrl,
                    MessageBody: JSON.stringify({
                        retryType: '1234',
                        retryStepIndex: 'payment',
                        retrySeconds: 5,
                        paymentResolve: null,
                        paymentReject: null,
                        refundResolve: null,
                        refundReject: null,
                        appConfigure: null,
                    }),
                })
                .promise();
        } catch (error) {
            return {
                statusCode: 500,
                body: JSON.stringify(error),
            };
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
