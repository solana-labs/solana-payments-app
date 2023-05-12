import { PrismaClient } from '@prisma/client';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { AppInstallQueryParam } from '../../models/install-query-params.model.js';
import { requestErrorResponse } from '../../utilities/request-response.utility.js';
import {
    verifyAndParseShopifyInstallRequest,
    createShopifyOAuthGrantRedirectUrl,
} from '../../utilities/shopify-install-request.utility.js';
import { MerchantService } from '../../services/database/merchant-service.database.service.js';

export const install = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    let parsedAppInstallQuery: AppInstallQueryParam;

    const prisma = new PrismaClient();
    const merchantService = new MerchantService(prisma);

    try {
        parsedAppInstallQuery = await verifyAndParseShopifyInstallRequest(event.queryStringParameters);
    } catch (error) {
        return requestErrorResponse(error);
    }

    const shop = parsedAppInstallQuery.shop;
    const newNonce = 'a';

    try {
        const merchant = await merchantService.getMerchant({ shop: shop });

        if (merchant == null) {
            await merchantService.createMerchant(shop, newNonce);
        } else {
            await merchantService.updateMerchant(merchant, {
                lastNonce: newNonce,
            });
        }
    } catch (error) {
        return requestErrorResponse(error);
    }

    // TODO: Start using the new nonce
    const redirectUrl = createShopifyOAuthGrantRedirectUrl(shop, shop);

    return {
        statusCode: 302,
        headers: {
            Location: redirectUrl,
            'Content-Type': 'text/html',
        },
        body: JSON.stringify({
            message: 'Redirecting..',
        }),
    };
};
