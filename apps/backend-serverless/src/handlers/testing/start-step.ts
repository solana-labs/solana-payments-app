import * as Sentry from '@sentry/serverless';
import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import pkg from 'aws-sdk';
// const AWS = require('aws-sdk');
const { StepFunctions } = pkg;
import { requestErrorResponse } from '../../utilities/request-response.utility.js';

Sentry.AWSLambda.init({
    dsn: 'https://dbf74b8a0a0e4927b9269aa5792d356c@o4505168718004224.ingest.sentry.io/4505168722526208',
    tracesSampleRate: 1.0,
});

export const startStep = Sentry.AWSLambda.wrapHandler(
    async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> => {
        const retryMachineArn = process.env.RETRY_ARN;

        if (retryMachineArn == null) {
            return requestErrorResponse(new Error('RETRY_ARN is not defined'));
        }

        const stepFunctionParams = {
            stateMachineArn: retryMachineArn,
            input: JSON.stringify({
                seconds: 5,
            }),
        };

        const stepFunctions = new StepFunctions();

        try {
            stepFunctions.startExecution(stepFunctionParams, (err, data) => {
                if (err) {
                    console.log(err);
                    console.log('error with step function');
                } else {
                    console.log('successfully started step function');
                }
            });
        } catch {
            return requestErrorResponse(new Error('Error starting step function'));
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
