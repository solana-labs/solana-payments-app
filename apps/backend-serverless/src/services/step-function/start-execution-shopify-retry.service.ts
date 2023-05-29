import pkg from 'aws-sdk';
import { ErrorMessage, ErrorType, errorResponse } from '../../utilities/responses/error-response.utility.js';
const { StepFunctions } = pkg;

/**
 *
 * @param input - stringified JSON object used as input to the step function
 * @returns nothing
 */
export const startExecutionOfShopifyMutationRetry = async (input: string) => {
    const stepFunctions = new StepFunctions();

    const retryMachineArn = process.env.RETRY_ARN;

    if (retryMachineArn == null) {
        return errorResponse(ErrorType.internalServerError, ErrorMessage.missingEnv);
    }

    var numberOfExecutionAttempts = 0;
    const maxNumberOfExecutionAttempts = 3;

    while (numberOfExecutionAttempts < maxNumberOfExecutionAttempts) {
        try {
            await stepFunctions
                .startExecution({
                    stateMachineArn: retryMachineArn,
                    input: input,
                })
                .promise();
            break;
        } catch (error) {
            // TODO: Log the error with sentry every time we hit this
        }

        numberOfExecutionAttempts += 1;
    }

    if (numberOfExecutionAttempts == maxNumberOfExecutionAttempts) {
        // TODO: Log in sentry as ctritical error
        throw new Error('Could not execute the shopify mutation step function');
    }
};
