import * as Sentry from '@sentry/serverless';
import { Merchant, PrismaClient, RefundRecord, RefundRecordStatus } from '@prisma/client';
import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import {
    RejectRefundRequest,
    parseAndValidateRejectRefundRequest,
} from '../../../../models/clients/merchant-ui/reject-refund-request.model.js';
import { RejectRefundResponse } from '../../../../models/shopify-graphql-responses/reject-refund-response.model.js';
import { RefundRecordService } from '../../../../services/database/refund-record-service.database.service.js';
import { MerchantService } from '../../../../services/database/merchant-service.database.service.js';
import { withAuth } from '../../../../utilities/clients/merchant-ui/token-authenticate.utility.js';
import { MerchantAuthToken } from '../../../../models/clients/merchant-ui/merchant-auth-token.model.js';
import { makeRefundSessionReject } from '../../../../services/shopify/refund-session-reject.service.js';
import axios from 'axios';
import { createErrorResponse } from '../../../../utilities/responses/error-response.utility.js';
import { sendRefundRejectRetryMessage } from '../../../../services/sqs/sqs-send-message.service.js';
import { validateRefundSessionRejected } from '../../../../services/shopify/validate-refund-session-rejected.service.js';
import { RefundSessionStateRejectedReason } from '../../../../models/shopify-graphql-responses/shared.model.js';
import { MissingExpectedDatabaseRecordError } from '../../../../errors/missing-expected-database-record.error.js';
import { UnauthorizedRequestError } from '../../../../errors/unauthorized-request.error.js';
import { ConflictingStateError } from '../../../../errors/conflicting-state.error.js';
import { DependencyError } from '../../../../errors/dependency.error.js';

const prisma = new PrismaClient();

Sentry.AWSLambda.init({
    dsn: process.env.SENTRY_DSN,
    tracesSampleRate: 1.0,
    integrations: [new Sentry.Integrations.Prisma({ client: prisma })],
});

export const rejectRefund = Sentry.AWSLambda.wrapHandler(
    async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> => {
        const refundRecordService = new RefundRecordService(prisma);
        const merchantService = new MerchantService(prisma);

        let merchantAuthToken: MerchantAuthToken;
        let rejectRefundRequest: RejectRefundRequest;

        try {
            merchantAuthToken = withAuth(event.cookies);
        } catch (error) {
            return createErrorResponse(error);
        }

        try {
            rejectRefundRequest = parseAndValidateRejectRefundRequest(event.queryStringParameters);
        } catch (error) {
            return createErrorResponse(error);
        }

        let refundRecord: RefundRecord | null;

        try {
            refundRecord = await refundRecordService.getRefundRecord({
                shopId: rejectRefundRequest.refundId,
            });
        } catch (error) {
            return createErrorResponse(error);
        }

        if (refundRecord == null) {
            return createErrorResponse(new MissingExpectedDatabaseRecordError('refund record'));
        }

        let merchant: Merchant | null;

        try {
            merchant = await merchantService.getMerchant({
                id: merchantAuthToken.id,
            });
        } catch (error) {
            return createErrorResponse(error);
        }

        if (merchant == null) {
            return createErrorResponse(new MissingExpectedDatabaseRecordError('merchant'));
        }

        if (merchant.id !== refundRecord.merchantId) {
            return createErrorResponse(new UnauthorizedRequestError('merchant does not own the refund'));
        }

        if (refundRecord.status !== RefundRecordStatus.pending) {
            return createErrorResponse(new ConflictingStateError('refund is not pending'));
        }

        const shop = merchant.shop;
        const accessToken = merchant.accessToken;

        if (accessToken == null) {
            return createErrorResponse(new UnauthorizedRequestError('merchant is missing valid access token'));
        }

        let rejectRefundResponse: RejectRefundResponse;
        const refundSessionReject = makeRefundSessionReject(axios);

        try {
            rejectRefundResponse = await refundSessionReject(
                refundRecord.shopGid,
                RefundSessionStateRejectedReason.processingError,
                rejectRefundRequest.merchantReason,
                shop,
                accessToken
            );

            validateRefundSessionRejected(rejectRefundResponse);
        } catch (error) {
            try {
                await sendRefundRejectRetryMessage(
                    refundRecord.id,
                    RefundSessionStateRejectedReason.processingError,
                    rejectRefundRequest.merchantReason
                );
            } catch (sendMessageError) {
                return createErrorResponse(new DependencyError('failed to send refund reject retry message'));
            }
        }

        try {
            await refundRecordService.updateRefundRecord(refundRecord, {
                status: RefundRecordStatus.rejected,
            });
        } catch (error) {
            // CRITICAL: Send to critical database error queue
            return createErrorResponse(new DependencyError('failed to update internal record. please retry.'));
        }

        return {
            statusCode: 204,
            body: JSON.stringify({}),
        };
    },
    {
        rethrowAfterCapture: false,
    }
);
