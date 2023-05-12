import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
<<<<<<< HEAD:apps/backend-serverless/src/handlers/payment-address.ts
import { requestErrorResponse } from '../utilities/request-response.utility.js';
import { PrismaClient } from '@prisma/client';
import { decode } from '../utilities/string.utility.js';
import queryString from 'query-string';
import { MerchantService } from '../services/database/merchant-service.database.service.js';
=======
import { requestErrorResponse } from '../../../utilities/request-response.utility.js';
import { PrismaClient } from '@prisma/client';
import { decode } from '../../../utilities/string.utility.js';
import queryString from 'query-string';
import { MerchantService } from '../../../services/database/merchant-service.database.service.js';
>>>>>>> 18848750eebbbf5f51640007b85eb26a18821e17:apps/backend-serverless/src/handlers/clients/merchant-ui/payment-address.ts

export const paymentAddress = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const prisma = new PrismaClient();

    const merchantService = new MerchantService(prisma);

    // ok realistically we probably have a service that does this for us
    const decodedBody = event.body ? decode(event.body) : '';
    const body = queryString.parse(decodedBody);
    // once we merge in the JWT code, we wont pull this from the body
    const merchantShop = body['shop'] as string | null;
    const paymentAddress = body['paymentAddress'] as string | null;

    if (merchantShop == null || paymentAddress == null) {
        return requestErrorResponse(new Error('No shop or payment address provided.'));
    }

    const merchant = await merchantService.getMerchant({ shop: merchantShop });

    if (merchant == null) {
        return requestErrorResponse(new Error('No merchant found.'));
    }

    try {
        await merchantService.updateMerchant(merchant, {
            paymentAddress: paymentAddress,
        });
    } catch {
        return requestErrorResponse(new Error('Failed to update merchant.'));
    }

    return {
        statusCode: 200,
        body: JSON.stringify(
            {
                message: 'Updated!',
            },
            null,
            2
        ),
    };
};
