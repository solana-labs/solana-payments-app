import { Merchant, PrismaClient, RefundRecord } from '@prisma/client';
import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import queryString from 'query-string';
import { decode } from '../../../../utilities/string.utility.js';
import { requestErrorResponse } from '../../../../utilities/request-response.utility.js';
import {
    RejectRefundRequest,
    parseAndValidateRejectRefundRequest,
} from '../../../../models/reject-refund-request.model.js';
import { refundSessionReject } from '../../../../services/shopify/refund-session-reject.service.js';
import { RejectRefundResponse } from '../../../../models/shopify-graphql-responses/reject-refund-response.model.js';
import { RefundRecordService } from '../../../../services/database/refund-record-service.database.service.js';
import { MerchantService } from '../../../../services/database/merchant-service.database.service.js';
import { withAuth } from '../../../../utilities/token-authenticate.utility.js';
import { MerchantAuthToken } from '../../../../models/merchant-auth-token.model.js';

export const rejectRefund = async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> => {
    const prisma = new PrismaClient();
    const refundRecordService = new RefundRecordService(prisma);
    const merchantService = new MerchantService(prisma);

    let merchantAuthToken: MerchantAuthToken;
    let rejectRefundRequest: RejectRefundRequest;
    let refundRecord: RefundRecord | null;
    let merchant: Merchant | null;

    try {
        merchantAuthToken = withAuth(event.cookies);
    } catch (error) {
        return requestErrorResponse(error);
    }

    try {
        rejectRefundRequest = parseAndValidateRejectRefundRequest(event.queryStringParameters);
    } catch (error) {
        return requestErrorResponse(error);
    }

    try {
        merchant = await merchantService.getMerchant({
            id: merchantAuthToken.id,
        });
    } catch (error) {
        return requestErrorResponse(error);
    }

    if (merchant == null) {
        return requestErrorResponse(new Error('No merchant found.'));
    }

    try {
        refundRecord = await refundRecordService.getRefundRecord({
            id: rejectRefundRequest.refundId,
        });
    } catch (error) {
        return requestErrorResponse(error);
    }

    if (refundRecord == null) {
        return requestErrorResponse(new Error('No refund record found.'));
    }

    if (merchant.id !== refundRecord.merchantId) {
        return requestErrorResponse(new Error('Refund record does not belong to merchant.'));
    }

    if (refundRecord.status !== 'pending') {
        return requestErrorResponse(new Error('Refund record is not pending.'));
    }

    const shop = merchant.shop;
    const accessToken = merchant.accessToken;

    if (accessToken == null) {
        return requestErrorResponse(new Error('Could not mutate on behalf of the Shopify merchant.'));
    }

    let rejectRefundResponse: RejectRefundResponse;
    try {
        rejectRefundResponse = await refundSessionReject(
            refundRecord.shopGid,
            'PROCESSING_ERROR', // Hardcoding this for now, shopify docs are slightly unclear on what the possible values are
            rejectRefundRequest.merchantReason,
            shop,
            accessToken
        );
    } catch (error) {
        return requestErrorResponse(error);
    }

    // TODO: Validate response from Shopify

    try {
        await refundRecordService.updateRefundRecord(refundRecord, {
            status: 'rejected',
        });
    } catch (error) {
        return requestErrorResponse(error);
    }

    // TODO: Define what the response should be
    return {
        statusCode: 200,
        body: JSON.stringify(rejectRefundResponse, null, 2),
    };
};
