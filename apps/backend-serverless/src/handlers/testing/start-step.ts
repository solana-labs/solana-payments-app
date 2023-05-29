import * as Sentry from '@sentry/serverless';
import {
    APIGatewayProxyEventV2,
    APIGatewayProxyResultV2,
    SQSHandler,
    SQSEvent,
    SQSMessageAttributes,
} from 'aws-lambda';
import pkg from 'aws-sdk';
// const AWS = require('aws-sdk');
const { StepFunctions } = pkg;
import { requestErrorResponse } from '../../utilities/request-response.utility.js';
import { parseAndValidateSQSMessage } from '../../models/sqs-message.model.js';

Sentry.AWSLambda.init({
    dsn: 'https://dbf74b8a0a0e4927b9269aa5792d356c@o4505168718004224.ingest.sentry.io/4505168722526208',
    tracesSampleRate: 1.0,
});

// TODO: rename this handler to something about the sqs starting here
// TODO: read the message from the queue
export const startStep = Sentry.AWSLambda.wrapHandler(
    async (event: SQSEvent): Promise<APIGatewayProxyResultV2> => {
        const stepFunctions = new StepFunctions();

        const retryMachineArn = process.env.RETRY_ARN;

        if (retryMachineArn == null) {
            return requestErrorResponse(new Error('RETRY_ARN is not defined'));
        }

        for (const record of event.Records) {
            console.log(record);

            try {
                // TODO: Replace this with a conditional for a message attribute on the type of message
                if (true) {
                    try {
                        await stepFunctions
                            .startExecution({
                                stateMachineArn: retryMachineArn,
                                input: record.body,
                            })
                            .promise();
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
