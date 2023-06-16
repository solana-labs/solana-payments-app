import * as Sentry from '@sentry/serverless';
import { APIGatewayProxyResultV2 } from 'aws-lambda';
import {
    ShopifyMutationRetry,
    ShopifyMutationRetryType,
    parseAndValidateShopifyMutationRetry,
} from '../../models/sqs/shopify-mutation-retry.model.js';
import { PrismaClient } from '@prisma/client';
import { InvalidInputError } from '../../errors/invalid-input.error.js';
import { retryPaymentResolve } from '../../services/shopify-retry/retry-payment-resolve.service.js';
import { retryPaymentReject } from '../../services/shopify-retry/retry-payment-reject.service.js';
import { retryRefundResolve } from '../../services/shopify-retry/retry-refund-resolve.service.js';
import { retryRefundReject } from '../../services/shopify-retry/retry-refund-reject.service.js';
import { retryAppConfigure } from '../../services/shopify-retry/retry-app-configure.service.js';
import { exhaustedRetrySteps } from '../../utilities/shopify-retry/shopify-retry.utility.js';
import { sendRetryMessage } from '../../services/sqs/sqs-send-message.service.js';
import axios from 'axios';

const prisma = new PrismaClient();

Sentry.AWSLambda.init({
    dsn: process.env.SENTRY_DSN,
    tracesSampleRate: 1.0,
    integrations: [new Sentry.Integrations.Prisma({ client: prisma })],
});

export const retry = Sentry.AWSLambda.wrapHandler(
    async (event: unknown): Promise<APIGatewayProxyResultV2> => {
        let shopifyMutationRetry: ShopifyMutationRetry;

        try {
            shopifyMutationRetry = parseAndValidateShopifyMutationRetry(event);
        } catch (error) {
            // Throwing should cause the step function to be retried. However, we should
            // manually view the error becuase it shouldn't work next titme either.
            // TODO: Log more data with the capture because the data here should be good to parse
            Sentry.captureException(error);
            throw new InvalidInputError('shopify mutation retry body'); // TODO: Critical Error
        }

        try {
            switch (shopifyMutationRetry.retryType) {
                case ShopifyMutationRetryType.paymentResolve:
                    console.log('payment resolve');
                    await retryPaymentResolve(shopifyMutationRetry.paymentResolve, prisma, axios);
                    break;
                case ShopifyMutationRetryType.paymentReject:
                    console.log('payment reject');
                    await retryPaymentReject(shopifyMutationRetry.paymentReject, prisma, axios);
                    break;
                case ShopifyMutationRetryType.refundResolve:
                    console.log('refund resolve');
                    await retryRefundResolve(shopifyMutationRetry.refundResolve, prisma, axios);
                    break;
                case ShopifyMutationRetryType.refundReject:
                    console.log('refund reject');
                    await retryRefundReject(shopifyMutationRetry.refundReject, prisma, axios);
                    break;
                case ShopifyMutationRetryType.appConfigure:
                    console.log('app configure');
                    await retryAppConfigure(shopifyMutationRetry.appConfigure, prisma, axios);
                    break;
            }
        } catch (error) {
            // add it back to the queue, then thing is though, it depends on what kind of error it is.
            // no merchant might not go back on the queue, that might require manual intervention
            // if its a shopify error, then it should go back on the queue
            const nextStep = shopifyMutationRetry.retryStepIndex + 1;
            if (exhaustedRetrySteps(nextStep)) {
                // Ok so I think what I'm going to do here is just add a new payment or refund
                // status called 'terminal' and if we get to the end, i will just set it to terminal
                // and exit out of the step function
                // TODO: Add terminal status
                return {
                    statusCode: 200,
                    body: JSON.stringify({}),
                };
            }

            try {
                await sendRetryMessage(
                    shopifyMutationRetry.retryType,
                    shopifyMutationRetry.paymentResolve,
                    shopifyMutationRetry.paymentReject,
                    shopifyMutationRetry.refundResolve,
                    shopifyMutationRetry.refundReject,
                    shopifyMutationRetry.appConfigure,
                    nextStep
                );
            } catch (error) {
                // TODO: Handle this with some kind of redunndancy
                // I need to figure out what to do in the case of SQS failures
                // The odds are low but never zero!
                throw new Error('SQS Failure'); // TODO: Critical Error
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
