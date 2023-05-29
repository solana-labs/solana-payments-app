import * as Sentry from '@sentry/serverless';
import { APIGatewayProxyResultV2, SQSEvent } from 'aws-lambda';
import pkg from 'aws-sdk';
const { StepFunctions } = pkg;
import { requestErrorResponse } from '../../utilities/request-response.utility.js';
import { error } from 'console';
import { ErrorMessage, ErrorType, errorResponse } from '../../utilities/responses/error-response.utility.js';

Sentry.AWSLambda.init({
    dsn: 'https://dbf74b8a0a0e4927b9269aa5792d356c@o4505168718004224.ingest.sentry.io/4505168722526208',
    tracesSampleRate: 1.0,
});

export const sqsMessageReceive = Sentry.AWSLambda.wrapHandler(
    async (event: SQSEvent): Promise<APIGatewayProxyResultV2> => {
        const stepFunctions = new StepFunctions();

        const retryMachineArn = process.env.RETRY_ARN;

        if (retryMachineArn == null) {
            return errorResponse(ErrorType.internalServerError, ErrorMessage.missingEnv);
        }

        // TODO: Process the message attributes

        for (const record of event.Records) {
            console.log(record);

            try {
                // TODO: Replace this with a conditional for a message attribute on the type of message
                if (true) {
                    try {
                        // TODO: I could parse the message here if we want as well so we can find out about
                        // the bad body before we execute the step function

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
