import pkg from 'aws-sdk';
import { MissingEnvError } from '../../errors/missing-env.error.js';
import { retry } from '../../utilities/shopify-retry/shopify-retry.utility.js';
const { StepFunctions } = pkg;

/**
 *
 * @param input - stringified JSON object used as input to the step function
 * @param stepFunctions - StepFunctions object to be used
 * @returns nothing
 */
// Dependency injection is used here for easier testing
export const startExecutionOfShopifyMutationRetry = async (
    input: string,
    stepFunctions: pkg.StepFunctions = new StepFunctions(),
) => {
    const retryMachineArn = process.env.RETRY_ARN;

    if (retryMachineArn == null) {
        throw new MissingEnvError('retry arn');
    }

    const maxNumberOfExecutionAttempts = 3;

    const attempts = await retry(
        () =>
            stepFunctions
                .startExecution({
                    stateMachineArn: retryMachineArn,
                    input: input,
                })
                .promise(),
        maxNumberOfExecutionAttempts,
    );

    if (attempts === maxNumberOfExecutionAttempts) {
        // TODO: Log in sentry as critical error
        throw new Error('Could not execute the shopify mutation step function');
    }
};
