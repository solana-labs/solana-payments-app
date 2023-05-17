import { PrismaClient } from '@prisma/client';
import { APIGatewayProxyEventV2, APIGatewayProxyResult } from 'aws-lambda';
import { withAuth } from '../../utilities/token-authenticate.utility.js';
import { requestErrorResponse } from '../../utilities/request-response.utility.js';
import { PaymentRecordService } from '../../services/database/payment-record-service.database.service.js';

const prisma = new PrismaClient();

export const paymentData = async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResult> => {
    const merchantAuthToken = withAuth(event);
    const shopId = merchantAuthToken.id;

    const paymentRecordService = new PaymentRecordService(prisma);

    try {
        const paymentRecords = await paymentRecordService.getPaymentRecordsForMerchant({
            shopId: shopId,
        });

        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(
                {
                    message: `Merchant info for shopId: ${shopId}`,
                    paymentRecords: paymentRecords,
                },
                null,
                2
            ),
        };
    } catch (error: unknown) {
        return requestErrorResponse(error);
    }
};
