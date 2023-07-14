import { PrismaClient, RefundRecordStatus } from '@prisma/client';
import * as Sentry from '@sentry/serverless';
import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import axios from 'axios';
import { ConflictingStateError } from '../../../../errors/conflicting-state.error.js';
import { DependencyError } from '../../../../errors/dependency.error.js';
import { MissingExpectedDatabaseRecordError } from '../../../../errors/missing-expected-database-record.error.js';
import { UnauthorizedRequestError } from '../../../../errors/unauthorized-request.error.js';
import { parseAndValidateRejectRefundRequest } from '../../../../models/clients/merchant-ui/reject-refund-request.model.js';
import { RejectRefundResponse } from '../../../../models/shopify-graphql-responses/reject-refund-response.model.js';
import { RefundSessionStateRejectedReason } from '../../../../models/shopify-graphql-responses/shared.model.js';
import { MerchantService } from '../../../../services/database/merchant-service.database.service.js';
import { RefundRecordService } from '../../../../services/database/refund-record-service.database.service.js';
import { makeRefundSessionReject } from '../../../../services/shopify/refund-session-reject.service.js';
import { validateRefundSessionRejected } from '../../../../services/shopify/validate-refund-session-rejected.service.js';
import { sendRefundRejectRetryMessage } from '../../../../services/sqs/sqs-send-message.service.js';
import { withAuth } from '../../../../utilities/clients/merchant-ui/token-authenticate.utility.js';
import { createErrorResponse } from '../../../../utilities/responses/error-response.utility.js';

const prisma = new PrismaClient();

Sentry.AWSLambda.init({
    dsn: process.env.SENTRY_DSN,
    tracesSampleRate: 1.0,
    integrations: [new Sentry.Integrations.Prisma({ client: prisma })],
});

export const rejectRefund = Sentry.AWSLambda.wrapHandler(
    async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> => {
        Sentry.captureEvent({
            message: 'in reject-refund',
            level: 'info',
        });
        const refundRecordService = new RefundRecordService(prisma);
        const merchantService = new MerchantService(prisma);

        try {
            const merchantAuthToken = withAuth(event.cookies);
            const merchant = await merchantService.getMerchant({ id: merchantAuthToken.id });
            const rejectRefundRequest = parseAndValidateRejectRefundRequest(event.queryStringParameters);
            const refundRecord = await refundRecordService.getRefundRecord({
                shopId: rejectRefundRequest.refundId,
            });
            if (refundRecord == null) {
                throw new MissingExpectedDatabaseRecordError('refund record');
            }
            if (merchant.id !== refundRecord.merchantId) {
                throw new UnauthorizedRequestError('merchant does not own the refund');
            }

            if (refundRecord.status !== RefundRecordStatus.pending) {
                throw new ConflictingStateError('refund is not pending');
            }

            const shop = merchant.shop;
            const accessToken = merchant.accessToken;
            if (accessToken == null) {
                throw new UnauthorizedRequestError('merchant is missing valid access token');
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
                    throw new DependencyError('failed to send refund reject retry message');
                }
            }

            try {
                await refundRecordService.updateRefundRecord(refundRecord, {
                    status: RefundRecordStatus.rejected,
                });
            } catch {
                throw new DependencyError('Failed to update internal record. Please retry.');
            }
            return {
                statusCode: 204,
                body: JSON.stringify({}),
            };
        } catch (error) {
            return createErrorResponse(error);
        }
    },
    {
        rethrowAfterCapture: false,
    }
);
