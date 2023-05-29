import * as Sentry from '@sentry/serverless';
import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import {
    ShopifyMutationAppConfigure,
    ShopifyMutationPaymentReject,
    ShopifyMutationPaymentResolve,
    ShopifyMutationRefundReject,
    ShopifyMutationRefundResolve,
    ShopifyMutationRetry,
    ShopifyMutationRetryType,
    parseAndValidateShopifyMutationRetry,
} from '../../models/shopify-mutation-retry.model.js';
import { PrismaClient, PaymentRecordStatus } from '@prisma/client';
import { MerchantService } from '../../services/database/merchant-service.database.service.js';
import { PaymentRecordService } from '../../services/database/payment-record-service.database.service.js';
import { RefundRecordService } from '../../services/database/refund-record-service.database.service.js';
import { requestErrorResponse } from '../../utilities/request-response.utility.js';
import axios from 'axios';
import { makePaymentSessionResolve } from '../../services/shopify/payment-session-resolve.service.js';
import { makeRefundSessionResolve } from '../../services/shopify/refund-session-resolve.service.js';
import { makePaymentAppConfigure } from '../../services/shopify/payment-app-configure.service.js';
import { makePaymentSessionReject } from '../../services/shopify/payment-session-reject.service.js';
import { MissingExpectedDatabaseRecordError } from '../../errors/missing-expected-database-record.error.js';
import { MissingExpectedDatabaseValueError } from '../../errors/missing-expected-database-value.error.js';
import { DependencyError } from '../../errors/dependency.error.js';
import pkg from 'aws-sdk';
import { makeRefundSessionReject } from '../../services/shopify/refund-session-reject.service.js';
import { refund } from '../shopify-handlers/refund.js';
import { MissingEnvError } from '../../errors/missing-env.error.js';
import { InvalidInputError } from '../../errors/InvalidInput.error.js';
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
        console.log('retry handler ping');
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

// These are the intervals I want to retry at
enum RetryTime {
    ZeroSeconds = 0,
    FiveSeconds = 5,
    TenSeconds = 10,
    ThirtySeconds = 30,
    FortyFiveSeconds = 45,
    OneMinute = 60,
    TwoMinutes = 120,
    FiveMinutes = 300,
    TwelveMinutes = 720,
    ThirtyEightMinutes = 2280,
    OneHour = 4560,
    TwoHours = 9120,
    FourHours = 18240,
}

const retryStepTimes: RetryTime[] = [
    RetryTime.ZeroSeconds,
    RetryTime.FiveSeconds,
    RetryTime.TenSeconds,
    RetryTime.ThirtySeconds,
    RetryTime.FortyFiveSeconds,
    RetryTime.OneMinute,
    RetryTime.TwoMinutes,
    RetryTime.FiveMinutes,
    RetryTime.TwelveMinutes,
    RetryTime.ThirtyEightMinutes,
    RetryTime.OneHour,
    RetryTime.TwoHours,
    RetryTime.FourHours,
    RetryTime.FourHours,
    RetryTime.FourHours,
    RetryTime.FourHours,
    RetryTime.FourHours,
];

const nextRetryTimeInterval = (stepIndex: number) => {
    return retryStepTimes[stepIndex];
};

const exhaustedRetrySteps = (stepIndex: number) => {
    return stepIndex >= retryStepTimes.length;
};

const retryPaymentResolve = async (paymentResolveInfo: ShopifyMutationPaymentResolve | null, prisma: PrismaClient) => {
    const merchantService = new MerchantService(prisma);
    const paymentRecordService = new PaymentRecordService(prisma);

    if (paymentResolveInfo == null) {
        throw new Error('Payment resolve info is null.');
    }

    const paymentRecord = await paymentRecordService.getPaymentRecord({ id: paymentResolveInfo.paymentId });

    if (paymentRecord == null) {
        throw new MissingExpectedDatabaseRecordError('payment record');
    }

    if (paymentRecord.shopGid == null) {
        throw new MissingExpectedDatabaseValueError('payment record shop gid');
    }

    const merchant = await merchantService.getMerchant({ id: paymentRecord.merchantId });

    if (merchant == null) {
        throw new MissingExpectedDatabaseRecordError('merchant');
    }

    if (merchant.accessToken == null) {
        throw new MissingExpectedDatabaseValueError('merchant access token');
    }

    const paymentSessionResolve = makePaymentSessionResolve(axios);

    const resolvePaymentResponse = await paymentSessionResolve(
        paymentRecord.shopGid,
        merchant.shop,
        merchant.accessToken
    );

    // Update the payment record
    const nextAction = resolvePaymentResponse.data.paymentSessionResolve.paymentSession.nextAction;

    // This might be unnecessary, if this should always be present for success
    // then we should reflect that in the parsing and types
    if (nextAction == null) {
        throw new Error('Could not find next action.');
    }

    // TODO: Change these states to be more acturate for states of returning
    const action = nextAction.action;
    const nextActionContext = nextAction.context;

    if (nextActionContext == null) {
        throw new Error('Could not find next action context.');
    }

    const redirectUrl = nextActionContext.redirectUrl;

    try {
        await paymentRecordService.updatePaymentRecord(paymentRecord, {
            status: PaymentRecordStatus.completed,
            redirectUrl: redirectUrl,
            completedAt: new Date(),
        });
    } catch {
        // Throw an error specifically about the database, might be able to handle this differently
        throw new Error('Could not update payment record.');
    }
};

const retryPaymentReject = async (paymentRejectInfo: ShopifyMutationPaymentReject | null, prisma: PrismaClient) => {
    const merchantService = new MerchantService(prisma);
    const paymentRecordService = new PaymentRecordService(prisma);

    if (paymentRejectInfo == null) {
        throw new Error('Payment reject info is null.');
    }

    const paymentRecord = await paymentRecordService.getPaymentRecord({ id: paymentRejectInfo.paymentId });

    if (paymentRecord == null) {
        throw new MissingExpectedDatabaseRecordError('payment record');
    }

    if (paymentRecord.shopGid == null) {
        throw new MissingExpectedDatabaseValueError('payment record shop gid');
    }

    const merchant = await merchantService.getMerchant({ id: paymentRecord.merchantId });

    if (merchant == null) {
        throw new MissingExpectedDatabaseRecordError('merchant');
    }

    if (merchant.accessToken == null) {
        throw new MissingExpectedDatabaseValueError('merchant access token');
    }

    const paymentSessionReject = makePaymentSessionReject(axios);

    const rejectPaymentResponse = await paymentSessionReject(
        paymentRecord.shopGid,
        paymentRejectInfo.reason,
        merchant.shop,
        merchant.accessToken
    );

    try {
        // TODO: We havne't implemented rejected payments yet, need to get this working then when i handle all of that
        await paymentRecordService.updatePaymentRecord(paymentRecord, {
            status: PaymentRecordStatus.rejected,
            completedAt: new Date(),
        });
    } catch {
        // Throw an error specifically about the database, might be able to handle this differently
        throw new Error('Could not update payment record.');
    }
};

const retryRefundResolve = async (refundResolveInfo: ShopifyMutationRefundResolve | null, prisma: PrismaClient) => {
    const merchantService = new MerchantService(prisma);
    const refundRecordService = new RefundRecordService(prisma);

    if (refundResolveInfo == null) {
        throw new Error('Refund resolve info is null.');
    }

    const refundRecord = await refundRecordService.getRefundRecord({ id: refundResolveInfo.refundId });

    if (refundRecord == null) {
        throw new Error('Could not find refund record.');
    }

    if (refundRecord.shopGid == null) {
        throw new Error('Could not find shop gid.');
    }

    const merchant = await merchantService.getMerchant({ id: refundRecord.merchantId });

    if (merchant == null) {
        throw new Error('Could not find merchant.');
    }

    if (merchant.accessToken == null) {
        throw new Error('Could not find access token.');
    }

    const refundSessionResolve = makeRefundSessionResolve(axios);

    try {
        const resolveRefundResponse = await refundSessionResolve(
            refundRecord.shopGid,
            merchant.shop,
            merchant.accessToken
        );

        // Validate the response

        // TODO: Make sure this is how I want to update refunds in this situation
        await refundRecordService.updateRefundRecord(refundRecord, {
            status: PaymentRecordStatus.completed,
            completedAt: new Date(),
        });
    } catch (error) {
        // Throw an error specifically about the database, might be able to handle this differently
        throw new Error('Could not update refund record.');
    }
};

const retryRefundReject = async (refundRejectInfo: ShopifyMutationRefundReject | null, prisma: PrismaClient) => {
    const merchantService = new MerchantService(prisma);
    const refundRecordService = new RefundRecordService(prisma);

    if (refundRejectInfo == null) {
        throw new Error('Refund reject info is null.');
    }

    const refundRecord = await refundRecordService.getRefundRecord({ id: refundRejectInfo.refundId });

    if (refundRecord == null) {
        throw new Error('Could not find refund record.');
    }

    if (refundRecord.shopGid == null) {
        throw new Error('Could not find shop gid.');
    }

    const merchant = await merchantService.getMerchant({ id: refundRecord.merchantId });

    if (merchant == null) {
        throw new Error('Could not find merchant.');
    }

    if (merchant.accessToken == null) {
        throw new Error('Could not find access token.');
    }

    const refundSessionReject = makeRefundSessionReject(axios);

    try {
        const resolveRefundResponse = await refundSessionReject(
            refundRecord.shopGid,
            refundRejectInfo.reason,
            'some reason',
            merchant.shop,
            merchant.accessToken
        );

        // Validate the response

        try {
            // TODO: Make sure this is how I want to update refunds in this situation
            await refundRecordService.updateRefundRecord(refundRecord, {
                status: PaymentRecordStatus.rejected,
                completedAt: new Date(),
            });
        } catch {
            // Throw an error specifically about the database, might be able to handle this differently
            throw new Error('Could not update refund record.');
        }
    } catch (error) {
        // Throw an error specifically about the database, might be able to handle this differently
        throw new Error('Could not update refund record.');
    }
};

const retryAppConfigure = async (appConfigureInfo: ShopifyMutationAppConfigure | null, prisma: PrismaClient) => {
    const merchantService = new MerchantService(prisma);

    if (appConfigureInfo == null) {
        throw new Error('App configure info is null.');
    }

    const merchant = await merchantService.getMerchant({ id: appConfigureInfo.merchantId });

    if (merchant == null) {
        throw new Error('Could not find merchant.');
    }

    if (merchant.accessToken == null) {
        throw new Error('Could not find access token.');
    }

    const paymentAppConfigure = makePaymentAppConfigure(axios);

    try {
        const configureAppResponse = await paymentAppConfigure(
            merchant.id,
            appConfigureInfo.state,
            merchant.shop,
            merchant.accessToken
        );

        // Validate the response

        // TODO: Update the merchant record to reflect that we configured the app
    } catch (error) {
        // Throw an error specifically about the database, might be able to handle this differently
        throw new Error('Could not update merchant record.');
    }
};
