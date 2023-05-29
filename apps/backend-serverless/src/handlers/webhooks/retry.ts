import * as Sentry from '@sentry/serverless';
import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { MessageQueuePayload, parseAndValidateMessageQueuePayload } from '../../models/message-queue-payload.model.js';
import { PrismaClient } from '@prisma/client';
import { MerchantService } from '../../services/database/merchant-service.database.service.js';
import { PaymentRecordService } from '../../services/database/payment-record-service.database.service.js';
import { RefundRecordService } from '../../services/database/refund-record-service.database.service.js';
import { requestErrorResponse } from '../../utilities/request-response.utility.js';
import axios from 'axios';
import { makePaymentSessionResolve } from '../../services/shopify/payment-session-resolve.service.js';
import { makeRefundSessionResolve } from '../../services/shopify/refund-session-resolve.service.js';
import { makePaymentAppConfigure } from '../../services/shopify/payment-app-configure.service.js';

Sentry.AWSLambda.init({
    dsn: 'https://dbf74b8a0a0e4927b9269aa5792d356c@o4505168718004224.ingest.sentry.io/4505168722526208',
    tracesSampleRate: 1.0,
});

export const retry = Sentry.AWSLambda.wrapHandler(
    async (event: unknown): Promise<APIGatewayProxyResultV2> => {
        const prisma = new PrismaClient();
        let retryMessage: MessageQueuePayload;

        console.log('successfully went down the line!');

        try {
            retryMessage = parseAndValidateMessageQueuePayload(event);
        } catch (error) {
            // If we can't parse a message on the queue, its a real problem that might require manual intervention
            // TODO: More details
            return requestErrorResponse(error);
        }

        try {
            switch (retryMessage.recordType) {
                case 'payment':
                    await retryPayment(retryMessage.recordId, prisma);
                    break;
                case 'refund':
                    // try to process refund
                    await retryRefund(retryMessage.recordId, prisma);
                    break;
                case 'app':
                    // try to process app
                    await retryConfigureApp(retryMessage.recordId, prisma);
                    break;
            }
        } catch (error) {
            // add it back to the queue, then thing is though, it depends on what kind of error it is.
            // no merchant might not go back on the queue, that might require manual intervention
            // if its a shopify error, then it should go back on the queue
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

const retryPayment = async (paymentId: string, prisma: PrismaClient) => {
    const merchantService = new MerchantService(prisma);
    const paymentRecordService = new PaymentRecordService(prisma);

    const paymentRecord = await paymentRecordService.getPaymentRecord({ id: paymentId });

    if (paymentRecord == null) {
        throw new Error('Could not find payment record.');
    }

    if (paymentRecord.shopGid == null) {
        throw new Error('Could not find shop gid.');
    }

    const merchant = await merchantService.getMerchant({ id: paymentRecord.merchantId });

    if (merchant == null) {
        throw new Error('Could not find merchant.');
    }

    if (merchant.accessToken == null) {
        throw new Error('Could not find access token.');
    }

    const paymentSessionResolve = makePaymentSessionResolve(axios);

    try {
        const resolvePaymentResponse = await paymentSessionResolve(
            paymentRecord.shopGid,
            merchant.shop,
            merchant.accessToken
        );

        // Validate the response

        // Update the payment record
    } catch (error) {
        // What happens if this fails?
        // well if it fails, that means they got us fucked up again, im gonna need to help them fuck around and find out
        // or i can just add it to a message queue again
    }
};

const retryRefund = async (refundId: string, prisma: PrismaClient) => {
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
        // What happens if this fails?
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

        // Update the merchant
    } catch (error) {
        // What happens if this fails?
    }
};
