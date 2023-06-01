import { Merchant, PrismaClient, RefundRecord, RefundRecordStatus } from '@prisma/client';
import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { requestErrorResponse } from '../../../../utilities/responses/request-response.utility.js';
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
import { ErrorMessage, ErrorType, errorResponse } from '../../../../utilities/responses/error-response.utility.js';
import { sendRefundRejectRetryMessage } from '../../../../services/sqs/sqs-send-message.service.js';

export const rejectRefund = async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> => {
    const prisma = new PrismaClient();
    const refundRecordService = new RefundRecordService(prisma);
    const merchantService = new MerchantService(prisma);

    let merchantAuthToken: MerchantAuthToken;
    let rejectRefundRequest: RejectRefundRequest;

    try {
        merchantAuthToken = withAuth(event.cookies);
    } catch (error) {
        return errorResponse(ErrorType.unauthorized, ErrorMessage.unauthorized);
    }

    try {
        rejectRefundRequest = parseAndValidateRejectRefundRequest(event.queryStringParameters);
    } catch (error) {
        return errorResponse(ErrorType.badRequest, ErrorMessage.invalidRequestParameters);
    }

    const refundRecord = await refundRecordService.getRefundRecord({
        shopId: rejectRefundRequest.refundId,
    });

    if (refundRecord == null) {
        return errorResponse(ErrorType.notFound, ErrorMessage.unknownRefundRecord);
    }

    const merchant = await merchantService.getMerchant({
        id: merchantAuthToken.id,
    });

    if (merchant == null) {
        return errorResponse(ErrorType.notFound, ErrorMessage.unknownMerchant);
    }

    if (merchant.id !== refundRecord.merchantId) {
        return errorResponse(ErrorType.conflict, ErrorMessage.incompatibleDatabaseRecords);
    }

    if (refundRecord.status !== RefundRecordStatus.pending) {
        return errorResponse(ErrorType.conflict, ErrorMessage.incorrectRefundRecordState);
    }

    const shop = merchant.shop;
    const accessToken = merchant.accessToken;

    if (accessToken == null) {
        return errorResponse(ErrorType.notFound, ErrorMessage.unauthorizedMerchant);
    }

    let rejectRefundResponse: RejectRefundResponse;
    const refundSessionReject = makeRefundSessionReject(axios);

    try {
        rejectRefundResponse = await refundSessionReject(
            refundRecord.shopGid,
            'PROCESSING_ERROR', // Hardcoding this for now, shopify docs are slightly unclear on what the possible values are
            rejectRefundRequest.merchantReason,
            shop,
            accessToken
        );

        // TODO: Validate the response from Shopify
    } catch (error) {
        try {
            await sendRefundRejectRetryMessage(refundRecord.id, 'PROCESSING_ERROR', rejectRefundRequest.merchantReason);
        } catch (sendMessageError) {
            // TODO: This should not happen but if it does we should log it
            // We will add some kind of redudancy to this later
            // For now we will just return an error. The good thing is that this is the safest error to have, reject-refund
        }

        return errorResponse(ErrorType.internalServerError, ErrorMessage.internalServerError);
    }

    try {
        await refundRecordService.updateRefundRecord(refundRecord, {
            status: RefundRecordStatus.rejected,
        });
    } catch (error) {
        // This will leave us in an odd spot because Shopify would be updated but we would not be
        // We should probably retry this as well but this will go along with what ever strategy we
        // use on failed database updates in general
        return errorResponse(ErrorType.internalServerError, ErrorMessage.internalServerError);
    }

    return {
        statusCode: 204,
        body: JSON.stringify({}),
    };
};
