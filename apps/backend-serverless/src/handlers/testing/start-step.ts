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
import { parseAndValidateMessageQueuePayload } from '../../models/message-queue-payload.model.js';

Sentry.AWSLambda.init({
    dsn: 'https://dbf74b8a0a0e4927b9269aa5792d356c@o4505168718004224.ingest.sentry.io/4505168722526208',
    tracesSampleRate: 1.0,
});

// TODO: read the message from the queue
export const startStep = Sentry.AWSLambda.wrapHandler(
    async (event: SQSEvent): Promise<APIGatewayProxyResultV2> => {
        // TODO: read the message from the queue

        const stepFunctions = new StepFunctions();

        const retryMachineArn = process.env.RETRY_ARN;

        if (retryMachineArn == null) {
            return requestErrorResponse(new Error('RETRY_ARN is not defined'));
        }

        for (const record of event.Records) {
            console.log(record);

            try {
                const messagePayload = parseAndValidateMessageQueuePayload(JSON.parse(record.body));

                console.log(messagePayload);

                const stepFunctionParams = {
                    stateMachineArn: retryMachineArn,
                    input: JSON.stringify({
                        seconds: 5, // TODO: make this dynamic based on message value
                        recordId: messagePayload.recordId,
                        recordType: messagePayload.recordType,
                    }),
                };

                // await sqs
                // .sendMessage({
                //     QueueUrl: queueUrl,
                //     MessageBody: JSON.stringify({
                //         // recordId: '1234',
                //         // recordType: 'payment',
                //         seconds: 5,
                //     }),
                // })
                // .promise();

                try {
                    await stepFunctions.startExecution(stepFunctionParams).promise();
                } catch (error) {
                    console.log(error);
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
