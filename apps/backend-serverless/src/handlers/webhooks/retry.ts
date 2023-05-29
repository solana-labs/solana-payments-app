import * as Sentry from '@sentry/serverless';
import { APIGatewayProxyResultV2 } from 'aws-lambda';
import {
    ShopifyMutationRetry,
    ShopifyMutationRetryType,
    parseAndValidateShopifyMutationRetry,
} from '../../models/shopify-mutation-retry.model.js';
import { PrismaClient, PaymentRecordStatus } from '@prisma/client';
import { MissingEnvError } from '../../errors/missing-env.error.js';
import { InvalidInputError } from '../../errors/InvalidInput.error.js';
import { retryPaymentResolve } from '../../services/shopify-retry/retry-payment-resolve.service.js';
import { retryPaymentReject } from '../../services/shopify-retry/retry-payment-reject.service.js';
import { retryRefundResolve } from '../../services/shopify-retry/retry-refund-resolve.service.js';
import { retryRefundReject } from '../../services/shopify-retry/retry-refund-reject.service.js';
import { retryAppConfigure } from '../../services/shopify-retry/retry-app-configure.service.js';
import pkg from 'aws-sdk';
import { exhaustedRetrySteps, nextRetryTimeInterval } from '../../utilities/shopify-retry/shopify-retry.utility.js';
const { StepFunctions } = pkg;

Sentry.AWSLambda.init({
    dsn: 'https://dbf74b8a0a0e4927b9269aa5792d356c@o4505168718004224.ingest.sentry.io/4505168722526208',
    tracesSampleRate: 1.0,
});
/*
A good next step here is to define everything that can go wrong to make sure we're handling it.
Also, i want to figure out if I can have a single structure for all of these retries or if I need 
multiple message types. It's probably best to handle multiple message types so that I can add more later if
needed without breaking anything.
 */
export const retry = Sentry.AWSLambda.wrapHandler(
    async (event: unknown): Promise<APIGatewayProxyResultV2> => {
        const prisma = new PrismaClient();
        const stepFunctions = new StepFunctions();

        const retryMachineArn = process.env.RETRY_ARN;

        if (retryMachineArn == null) {
            throw new MissingEnvError('retry arn'); // TODO: Critical Error
        }

        let shopifyMutationRetry: ShopifyMutationRetry;

        try {
            shopifyMutationRetry = parseAndValidateShopifyMutationRetry(event);
        } catch (error) {
            throw new InvalidInputError('shopify mutation retry body'); // TODO: Critical Error
        }

        try {
            switch (shopifyMutationRetry.retryType) {
                case ShopifyMutationRetryType.paymentResolve:
                    await retryPaymentResolve(shopifyMutationRetry.paymentResolve, prisma);
                    break;
                case ShopifyMutationRetryType.paymentReject:
                    await retryPaymentReject(shopifyMutationRetry.paymentReject, prisma);
                    break;
                case ShopifyMutationRetryType.refundResolve:
                    await retryRefundResolve(shopifyMutationRetry.refundResolve, prisma);
                    break;
                case ShopifyMutationRetryType.refundReject:
                    await retryRefundReject(shopifyMutationRetry.refundReject, prisma);
                    break;
                case ShopifyMutationRetryType.appConfigure:
                    await retryAppConfigure(shopifyMutationRetry.appConfigure, prisma);
                    break;
            }
        } catch (error) {
            // add it back to the queue, then thing is though, it depends on what kind of error it is.
            // no merchant might not go back on the queue, that might require manual intervention
            // if its a shopify error, then it should go back on the queue

            const nextStep = shopifyMutationRetry.retryStepIndex + 1;

            if (exhaustedRetrySteps(nextStep)) {
                // TODO: Figure out how to handle this
                // Figure out how to exit the step function here without adding another message
                // This would be a critical error, so i would want to be notified, we would likley need
                // to reach out to shopify for support.
                return {
                    statusCode: 200,
                    body: JSON.stringify({}),
                };
            }

            const nextTimeInterval = nextRetryTimeInterval(nextStep);

            const stepFunctionParams = {
                stateMachineArn: retryMachineArn,
                input: JSON.stringify({
                    retryType: shopifyMutationRetry.retryType,
                    retryStepIndex: nextStep,
                    retrySeconds: nextTimeInterval,
                    paymentResolve: shopifyMutationRetry.paymentResolve,
                    paymentReject: shopifyMutationRetry.paymentReject,
                    refundResolve: shopifyMutationRetry.refundResolve,
                    refundReject: shopifyMutationRetry.refundReject,
                    appConfigure: shopifyMutationRetry.appConfigure,
                }),
            };

            try {
                await stepFunctions.startExecution(stepFunctionParams).promise();
            } catch (error) {
                // TODO: What happens if this fails?
                // TODO: If this fails, I probably  want ot throw and log what ever error made it throw
                // The reason I would want to throw is to cause this attempt to retry and hopefully succeed
            }
        }

        return {
            statusCode: 200,
            body: JSON.stringify({}),
        };
    },
    {
        rethrowAfterCapture: true,
    }
);
