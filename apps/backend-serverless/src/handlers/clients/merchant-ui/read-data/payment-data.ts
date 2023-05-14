import * as Sentry from '@sentry/serverless';
import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { requestErrorResponse } from '../../../../utilities/request-response.utility.js';
import { PrismaClient } from '@prisma/client';
import { MerchantAuthToken } from '../../../../models/merchant-auth-token.model.js';
import { withAuth } from '../../../../utilities/token-authenticate.utility.js';
import { PaymentRecordService } from '../../../../services/database/payment-record-service.database.service.js';
import {
    PaymentDataRequestParameters,
    parseAndValidatePaymentDataRequestParameters,
} from '../../../../models/payment-data-request.model.js';
import { Pagination, DEFAULT_PAGINATION_SIZE } from '../../../../utilities/database-services.utility.js';
import { MerchantService } from '../../../../services/database/merchant-service.database.service.js';
import { createPaymentDataResponseFromPaymentRecord } from '../../../../utilities/payment-record.utility.js';

Sentry.AWSLambda.init({
    dsn: 'https://dbf74b8a0a0e4927b9269aa5792d356c@o4505168718004224.ingest.sentry.io/4505168722526208',
    tracesSampleRate: 1.0,
});

export const paymentData = Sentry.AWSLambda.wrapHandler(
    async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> => {
        const prisma = new PrismaClient();
        const paymentRecordService = new PaymentRecordService(prisma);
        const merchantService = new MerchantService(prisma);

        let merchantAuthToken: MerchantAuthToken;
        let paymentDataRequestParameters: PaymentDataRequestParameters;

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
            paymentDataRequestParameters = parseAndValidatePaymentDataRequestParameters(event.queryStringParameters);
        } catch (error) {
            return requestErrorResponse(error);
        }

        const pagination: Pagination = {
            page: paymentDataRequestParameters.page,
            pageSize: DEFAULT_PAGINATION_SIZE,
        };

        const paymentRecords = await paymentRecordService.getPaymentRecordsForMerchantWithPagination(
            { merchantId: merchant.id },
            pagination
        );

        if (paymentRecords == null || paymentRecords.length == 0) {
            // should we handle this different ???
            // idk but for now im gonna throw if there is null
            // TODO: Figure out how to handle this
            return requestErrorResponse(new Error('Could not find payment records'));
        }

        const total = await paymentRecordService.getTotalPaymentRecordsForMerchant({ merchantId: merchant.id });

        const paymentRecordResponseData = paymentRecords.map(paymentRecord => {
            createPaymentDataResponseFromPaymentRecord(paymentRecord);
        });

        const responesBodyData = {
            paymentData: {
                page: pagination.page,
                perPage: pagination.pageSize,
                total: total,
                data: paymentRecordResponseData,
            },
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
