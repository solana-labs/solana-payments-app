import * as Sentry from '@sentry/serverless';
import pkg from 'aws-sdk';
import { MissingEnvError } from '../../errors/missing-env.error.js';
import { retry } from '../../utilities/shopify-retry/shopify-retry.utility.js';

const { StepFunctions } = pkg;

/**
 *
 * @param stepFunctions - StepFunctions object to be used
 * @returns nothing
 */
// Dependency injection is used here for easier testing
export const startExecutionOfSafetySweep = async (
    key: string,
    stepFunctions: pkg.StepFunctions = new StepFunctions()
) => {
    const safetyMachineArn = process.env.SAFETY_ARN;

    if (safetyMachineArn == null) {
        throw new MissingEnvError('safety arn');
    }

    const maxNumberOfExecutionAttempts = 3;

    const attempts = await retry(
        () =>
            stepFunctions
                .startExecution({
                    stateMachineArn: safetyMachineArn,
                    input: JSON.stringify({ key: key }),
                })
                .promise(),
        maxNumberOfExecutionAttempts
    );

    // TODO: Get error out of retry
    if (attempts === maxNumberOfExecutionAttempts) {
        const error = new Error('Could not execute the shopify mutation step function');
        console.log(error);
        Sentry.captureException(error);
        throw error;
    }
};
