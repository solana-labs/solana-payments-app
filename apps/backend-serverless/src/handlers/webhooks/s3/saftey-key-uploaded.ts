import * as Sentry from '@sentry/serverless';
import { APIGatewayProxyResultV2, S3Event } from 'aws-lambda';
import axios from 'axios';
import { startExecutionOfSafteySweep } from '../../../services/step-function/start-execution-saftey-sweep.service.js';

export const safteyKeyUploaded = Sentry.AWSLambda.wrapHandler(
    async (event: S3Event): Promise<APIGatewayProxyResultV2> => {
        // try {
        //     shopifyMutationRetry = parseAndValidateShopifyMutationRetry(event);
        // } catch (error) {
        //     // Throwing should cause the step function to be retried. However, we should
        //     // manually view the error becuase it shouldn't work next titme either.
        //     // TODO: Log more data with the capture because the data here should be good to parse
        //     Sentry.captureException(error);
        //     throw new InvalidInputError('shopify mutation retry body'); // TODO: Critical Error
        // }

        for (const record of event.Records) {
            try {
                await startExecutionOfSafteySweep(record.s3.object.key);
            } catch (error) {
                console.log(error);
                throw new Error('Could not execute the shopify mutation step function');
            }
        }

        console.log('made it to saftey key uploaded');

        return {
            statusCode: 200,
            body: JSON.stringify({}),
        };
    },
    {
        rethrowAfterCapture: true,
    }
);
