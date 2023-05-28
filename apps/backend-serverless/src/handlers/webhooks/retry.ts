import * as Sentry from '@sentry/serverless';
import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';

Sentry.AWSLambda.init({
    dsn: 'https://dbf74b8a0a0e4927b9269aa5792d356c@o4505168718004224.ingest.sentry.io/4505168722526208',
    tracesSampleRate: 1.0,
});

export const retry = Sentry.AWSLambda.wrapHandler(
    async (event: unknown): Promise<APIGatewayProxyResultV2> => {
        console.log('successfully went down the line!');
        // parse the event here and retry it all

        return {
            statusCode: 200,
            body: JSON.stringify({}),
        };
    },
    {
        rethrowAfterCapture: true,
    }
);
