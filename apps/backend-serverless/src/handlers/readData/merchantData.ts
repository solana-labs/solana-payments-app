import { PrismaClient } from '@prisma/client';
import { APIGatewayProxyEventV2, APIGatewayProxyResult } from 'aws-lambda';
import { withAuth } from '../../utilities/token-authenticate.utility.js';
import { MerchantService } from '../../services/database/merchant-service.database.service.js';
import { requestErrorResponse } from '../../utilities/request-response.utility.js';

const prisma = new PrismaClient();

export async function merchantData(event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResult> {
    console.log('in merchant data');
    const shopId = withAuth(event);
    console.log('got auth shopif', shopId);

    const merchantService = new MerchantService(prisma);

    try {
        console.log('getting merchant', shopId);
        const merchant = await merchantService.getMerchant({ shop: shopId });

        if (merchant == null) {
            throw new Error('Merchant not found.');
        }

        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(
                {
                    message: `Merchant info for shopId: ${shopId}, shop: ${merchant.shop}`,
                    merchant: merchant,
                },
                null,
                2
            ),
        };
    } catch (error: unknown) {
        return requestErrorResponse(error);
    }
}
