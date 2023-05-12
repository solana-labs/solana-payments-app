import { PrismaClient } from '@prisma/client';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { AppRedirectQueryParam } from '../../models/redirect-query-params.model.js';
import { fetchAccessToken } from '../../services/fetch-access-token.service.js';
import { requestErrorResponse } from '../../utilities/request-response.utility.js';
import { verifyAndParseShopifyRedirectRequest } from '../../utilities/shopify-redirect-request.utility.js';
import { paymentAppConfigure } from '../../services/shopify/payment-app-configure.service.js';
import { MerchantService } from '../../services/database/merchant-service.database.service.js';
import { AccessTokenResponse } from '../../models/access-token-response.model.js';

export const redirect = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const prisma = new PrismaClient();
    const merchantService = new MerchantService(prisma);

    let parsedAppRedirectQuery: AppRedirectQueryParam;
    let accessTokenResponse: AccessTokenResponse;

    try {
        parsedAppRedirectQuery = await verifyAndParseShopifyRedirectRequest(event.queryStringParameters);
    } catch (error) {
        return requestErrorResponse(error);
    }

    const shop = parsedAppRedirectQuery.shop;
    const code = parsedAppRedirectQuery.code;

    try {
        accessTokenResponse = await fetchAccessToken(shop, code);
    } catch (error) {
        return requestErrorResponse(error);
    }

    const merchant = await merchantService.getMerchant({ shop: shop });

    if (merchant == null) {
        return requestErrorResponse(new Error('Merchant not found'));
    }

    const updateData = {
        accessToken: accessTokenResponse.access_token,
        scopes: accessTokenResponse.scope,
    };

    try {
        await merchantService.updateMerchant(merchant, updateData);
    } catch (error) {
        return requestErrorResponse(error);
    }

    const configure = await paymentAppConfigure('greatMerchant123', true, shop, accessTokenResponse.access_token);

    const redirectUrl = process.env.MERCHANT_UI_URL;

    if (redirectUrl == null) {
        return requestErrorResponse(new Error('Merchant redirect location is not set'));
    }

    return {
        statusCode: 301,
        headers: {
            Location: redirectUrl,
            'Content-Type': 'text/html',
        },
        body: JSON.stringify({}),
    };
};
