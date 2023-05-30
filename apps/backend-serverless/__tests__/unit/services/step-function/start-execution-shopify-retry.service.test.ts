import { startExecutionOfShopifyMutationRetry } from '../../../../src/services/step-function/start-execution-shopify-retry.service.js';
import { StepFunctions } from 'aws-sdk';

describe('unit testing start execution shopify retry', () => {
    it('should execute succesfully', async () => {
        // Set up env
        process.env.RETRY_ARN = 'some-arn';

        // Set up mock StepFunctions
        const mockStepFunctions = {
            startExecution: jest.fn().mockImplementation(() => {
                return {
                    promise: () => Promise.resolve(),
                };
            }),
        } as unknown as StepFunctions;

        // invoke startExecutionOfShopifyMutationRetry
        const mockInput = 'mock-input';
        await startExecutionOfShopifyMutationRetry(mockInput, mockStepFunctions);

        // Test
        expect(mockStepFunctions.startExecution).toHaveBeenCalledWith({
            stateMachineArn: 'some-arn',
            input: mockInput,
        });
    });
});
