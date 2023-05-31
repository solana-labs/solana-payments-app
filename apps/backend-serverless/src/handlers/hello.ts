import * as Sentry from '@sentry/serverless';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { requestErrorResponse } from '../utilities/responses/request-response.utility.js';

Sentry.AWSLambda.init({
    dsn: 'https://dbf74b8a0a0e4927b9269aa5792d356c@o4505168718004224.ingest.sentry.io/4505168722526208',
    tracesSampleRate: 1.0,
});

export const hello = Sentry.AWSLambda.wrapHandler(
    async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
        // I see that you're returning a 500 status code. If there's an error you want to capture, you can do that here.
        // For instance:
        try {
            throw new Error('This is an error');
        } catch (error) {
            Sentry.captureException(error);
            return requestErrorResponse(error);
        }

        return {
            statusCode: 200,
            body: JSON.stringify(
                {
                    message: 'Hello, world!',
                },
                null,
                2
            ),
        };
    },
    {
        rethrowAfterCapture: true,
    }
);
