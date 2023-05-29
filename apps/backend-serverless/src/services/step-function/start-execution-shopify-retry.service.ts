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

    await stepFunctions
        .startExecution({
            stateMachineArn: retryMachineArn,
            input: input,
        })
        .promise();
};
