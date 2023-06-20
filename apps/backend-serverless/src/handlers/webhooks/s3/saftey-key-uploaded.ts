import * as Sentry from '@sentry/serverless';
import { APIGatewayProxyResultV2, S3Event } from 'aws-lambda';
import axios from 'axios';
import { startExecutionOfSafteySweep } from '../../../services/step-function/start-execution-saftey-sweep.service.js';

export const safteyKeyUploaded = Sentry.AWSLambda.wrapHandler(
    async (event: S3Event): Promise<APIGatewayProxyResultV2> => {
        for (const record of event.Records) {
            try {
                await startExecutionOfSafteySweep(record.s3.object.key);
            } catch (error) {
                console.log(error);
                throw new Error('Could not execute the shopify mutation step function');
            }
        }

        return {
            statusCode: 200,
            body: JSON.stringify({}),
        };
    },
    {
        rethrowAfterCapture: false,
    }
);
