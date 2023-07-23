import { PrismaClient } from '@prisma/client';
import * as Sentry from '@sentry/serverless';
import { APIGatewayProxyResultV2 } from 'aws-lambda';
import axios from 'axios';
import { InvalidInputError } from '../../errors/invalid-input.error';
import {
    ShopifyMutationRetry,
    ShopifyMutationRetryType,
    parseAndValidateShopifyMutationRetry,
} from '../../models/sqs/shopify-mutation-retry.model';
import { retryAppConfigure } from '../../services/shopify-retry/retry-app-configure.service';
import { retryPaymentReject } from '../../services/shopify-retry/retry-payment-reject.service';
import { retryPaymentResolve } from '../../services/shopify-retry/retry-payment-resolve.service';
import { retryRefundReject } from '../../services/shopify-retry/retry-refund-reject.service';
import { retryRefundResolve } from '../../services/shopify-retry/retry-refund-resolve.service';
import { sendRetryMessage } from '../../services/sqs/sqs-send-message.service';
import { createErrorResponse } from '../../utilities/responses/error-response.utility';
import { exhaustedRetrySteps } from '../../utilities/shopify-retry/shopify-retry.utility';

const prisma = new PrismaClient();

Sentry.AWSLambda.init({
    dsn: process.env.SENTRY_DSN,
    tracesSampleRate: 1.0,
    integrations: [new Sentry.Integrations.Prisma({ client: prisma })],
});

export const retry = Sentry.AWSLambda.wrapHandler(
    async (event: unknown): Promise<APIGatewayProxyResultV2> => {
        Sentry.captureEvent({
            message: 'in retry',
            level: 'info',
        });
        let shopifyMutationRetry: ShopifyMutationRetry;

        try {
            shopifyMutationRetry = parseAndValidateShopifyMutationRetry(event);
        } catch (error) {
            return createErrorResponse(new InvalidInputError('Shopify Mutation retry body'));
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
                return createErrorResponse(error);
            }
        }

        return {
            statusCode: 200,
            body: JSON.stringify({}),
        };
    },
    {
        rethrowAfterCapture: false,
    }
);
