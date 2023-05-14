import * as Sentry from '@sentry/serverless';
import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { requestErrorResponse } from '../../../../utilities/request-response.utility.js';
import { PrismaClient } from '@prisma/client';
import { RefundRecordService } from '../../../../services/database/refund-record-service.database.service.js';
import { MerchantService } from '../../../../services/database/merchant-service.database.service.js';
import { MerchantAuthToken } from '../../../../models/merchant-auth-token.model.js';
import {
    RefundDataRequestParameters,
    parseAndValidateRefundDataRequestParameters,
} from '../../../../models/refund-data-request.model.js';
import { withAuth } from '../../../../utilities/token-authenticate.utility.js';
import { DEFAULT_PAGINATION_SIZE, Pagination } from '../../../../utilities/database-services.utility.js';
import { createRefundDataResponseFromRefundRecord } from '../../../../utilities/refund-record.utility.js';
import { createGeneralResponse } from '../../../../utilities/create-general-response.js';

Sentry.AWSLambda.init({
    dsn: 'https://dbf74b8a0a0e4927b9269aa5792d356c@o4505168718004224.ingest.sentry.io/4505168722526208',
    tracesSampleRate: 1.0,
});

export const refundData = Sentry.AWSLambda.wrapHandler(
    async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> => {
        const prisma = new PrismaClient();
        const refundRecordService = new RefundRecordService(prisma);
        const merchantService = new MerchantService(prisma);

        let merchantAuthToken: MerchantAuthToken;
        let refundDataRequestParameters: RefundDataRequestParameters;

        try {
            merchantAuthToken = withAuth(event.cookies);
        } catch (error) {
            return requestErrorResponse(error);
        }

        const merchant = await merchantService.getMerchant({ id: merchantAuthToken.id });

        if (merchant == null) {
            return requestErrorResponse(new Error('Could not find merchant.'));
        }

        try {
            refundDataRequestParameters = parseAndValidateRefundDataRequestParameters(event.queryStringParameters);
        } catch (error) {
            return requestErrorResponse(error);
        }

        const pagination: Pagination = {
            page: refundDataRequestParameters.page,
            pageSize: DEFAULT_PAGINATION_SIZE,
        };

        const refundRecords = await refundRecordService.getRefundRecordsForMerchantWithPagination(
            { merchantId: merchant.id },
            pagination
        );

        if (refundRecords == null || refundRecords.length == 0) {
            // should we handle this different ???
            // idk but for now im gonna throw if there is null
            // TODO: Figure out how to handle this
            return requestErrorResponse(new Error('Could not find payment records'));
        }

        const total = await refundRecordService.getTotalRefundRecordsForMerchant({ merchantId: merchant.id });

        const refundRecordResponseData = refundRecords.map(refundRecord => {
            createRefundDataResponseFromRefundRecord(refundRecord);
        });

        const generalResponse = await createGeneralResponse(merchantAuthToken, prisma);

        // TODO: Create a type for this
        const responesBodyData = {
            refundData: {
                page: pagination.page,
                perPage: pagination.pageSize,
                total: total,
                data: refundRecordResponseData,
            },
            general: generalResponse,
        };

        return {
            statusCode: 200,
            body: JSON.stringify(responesBodyData),
        };
    },
    {
        rethrowAfterCapture: true,
    }
);
