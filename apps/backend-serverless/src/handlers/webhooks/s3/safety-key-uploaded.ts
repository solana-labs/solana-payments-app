import * as Sentry from '@sentry/serverless';
import { APIGatewayProxyResultV2, S3Event } from 'aws-lambda';
import { startExecutionOfSafetySweep } from '../../../services/step-function/start-execution-safety-sweep.service';
import { createErrorResponse } from '../../../utilities/responses/error-response.utility';

export const safetyKeyUploaded = Sentry.AWSLambda.wrapHandler(
    async (event: S3Event): Promise<APIGatewayProxyResultV2> => {
        Sentry.captureEvent({
            message: 'in safety key uploaded',
            level: 'info',
        });
        for (const record of event.Records) {
            try {
                await startExecutionOfSafetySweep(record.s3.object.key);
            } catch (error) {
                return createErrorResponse(new Error('Could not execute the shopify mutation step function'));
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
