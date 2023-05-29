import * as Sentry from '@sentry/serverless';
import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { MessageQueuePayload, parseAndValidateMessageQueuePayload } from '../../models/message-queue-payload.model.js';
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
const { StepFunctions } = pkg;

Sentry.AWSLambda.init({
    dsn: 'https://dbf74b8a0a0e4927b9269aa5792d356c@o4505168718004224.ingest.sentry.io/4505168722526208',
    tracesSampleRate: 1.0,
});

export const retry = Sentry.AWSLambda.wrapHandler(
    async (event: unknown): Promise<APIGatewayProxyResultV2> => {
        console.log('retry handler ping');
        const prisma = new PrismaClient();
        const stepFunctions = new StepFunctions();

        const retryMachineArn = process.env.RETRY_ARN;

        if (retryMachineArn == null) {
            // I think i can safely throw here since this is a handler for my step function
            // I can then configure the step function to retry this handler
            // This would be a critical error, so i would want to be notified
            return requestErrorResponse(new Error('RETRY_ARN is not defined'));
        }

        let retryMessage: MessageQueuePayload;

        try {
            retryMessage = parseAndValidateMessageQueuePayload(event);
        } catch (error) {
            // If we can't parse a message on the queue, its a real problem that might require manual intervention
            // this would be a critical error
            // TODO: More details
            return requestErrorResponse(error);
        }

        try {
            switch (retryMessage.recordType) {
                // TODO Make these cases an enum
                case 'payment-resolve':
                    await retryPaymentResolve(retryMessage.recordId, prisma);
                    break;
                case 'payment-reject':
                    break;
                case 'refund-resolve':
                    await retryRefundResolve(retryMessage.recordId, prisma);
                    break;
                case 'refund-reject':
                    await retryRefundResolve(retryMessage.recordId, prisma);
                    break;
                case 'app-configure':
                    await retryConfigureApp(retryMessage.recordId, prisma);
                    break;
            }
        } catch (error) {
            // add it back to the queue, then thing is though, it depends on what kind of error it is.
            // no merchant might not go back on the queue, that might require manual intervention
            // if its a shopify error, then it should go back on the queue

            const timeInterval = nextTimeInterval(retryMessage.seconds);

            const stepFunctionParams = {
                stateMachineArn: retryMachineArn,
                input: JSON.stringify({
                    seconds: timeInterval,
                    recordId: retryMessage.recordId,
                    recordType: retryMessage.recordType,
                }),
            };

            try {
                await stepFunctions.startExecution(stepFunctionParams).promise();
            } catch (error) {
                // TODO: What happens if this fails?
                // What would i do if this fails? Can i return an error and have my step function retry this?
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

// Right now this is based on number of seconds but i might want to just make an enum of "steps"
// instead to handle for repeat numbers of seconds
const nextTimeInterval = (seconds: number) => {
    switch (seconds) {
        case RetryTime.ZeroSeconds:
            return RetryTime.FiveSeconds;
        case RetryTime.FiveSeconds:
            return RetryTime.TenSeconds;
        case RetryTime.TenSeconds:
            return RetryTime.ThirtySeconds;
        case RetryTime.ThirtySeconds:
            return RetryTime.FortyFiveSeconds;
        case RetryTime.FortyFiveSeconds:
            return RetryTime.OneMinute;
        case RetryTime.OneMinute:
            return RetryTime.TwoMinutes;
        case RetryTime.TwoMinutes:
            return RetryTime.FiveMinutes;
        case RetryTime.FiveMinutes:
            return RetryTime.TwelveMinutes;
        case RetryTime.TwelveMinutes:
            return RetryTime.ThirtyEightMinutes;
        case RetryTime.ThirtyEightMinutes:
            return RetryTime.OneHour;
        case RetryTime.OneHour:
            return RetryTime.TwoHours;
    }
};

const retryPaymentResolve = async (paymentId: string, prisma: PrismaClient) => {
    const merchantService = new MerchantService(prisma);
    const paymentRecordService = new PaymentRecordService(prisma);

    const paymentRecord = await paymentRecordService.getPaymentRecord({ id: paymentId });

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

const retryPaymentReject = async (paymentId: string, prisma: PrismaClient) => {
    const merchantService = new MerchantService(prisma);
    const paymentRecordService = new PaymentRecordService(prisma);

    const paymentRecord = await paymentRecordService.getPaymentRecord({ id: paymentId });

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
        'some reason',
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

const retryRefundResolve = async (refundId: string, prisma: PrismaClient) => {
    const merchantService = new MerchantService(prisma);
    const refundRecordService = new RefundRecordService(prisma);

    const refundRecord = await refundRecordService.getRefundRecord({ id: refundId });

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

        // Update the refund record
    } catch (error) {
        // Throw an error specifically about the database, might be able to handle this differently
        throw new Error('Could not update refund record.');
    }
};

const retryRefundReject = async (refundId: string, prisma: PrismaClient) => {
    const merchantService = new MerchantService(prisma);
    const refundRecordService = new RefundRecordService(prisma);

    const refundRecord = await refundRecordService.getRefundRecord({ id: refundId });

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
            'some code',
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

const retryConfigureApp = async (merchantId: string, prisma: PrismaClient) => {
    const merchantService = new MerchantService(prisma);

    const merchant = await merchantService.getMerchant({ id: merchantId });

    if (merchant == null) {
        throw new Error('Could not find merchant.');
    }

    if (merchant.accessToken == null) {
        throw new Error('Could not find access token.');
    }

    const paymentAppConfigure = makePaymentAppConfigure(axios);

    try {
        const configureAppResponse = await paymentAppConfigure(merchant.id, true, merchant.shop, merchant.accessToken);

        // Validate the response

        // TODO: Update the merchant record to reflect that we configured the app
    } catch (error) {
        // Throw an error specifically about the database, might be able to handle this differently
        throw new Error('Could not update merchant record.');
    }
};
