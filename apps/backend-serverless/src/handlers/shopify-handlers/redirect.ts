import { PrismaClient } from '@prisma/client';
import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { AppRedirectQueryParam } from '../../models/redirect-query-params.model.js';
import { fetchAccessToken } from '../../services/fetch-access-token.service.js';
import { requestErrorResponse } from '../../utilities/request-response.utility.js';
import { verifyAndParseShopifyRedirectRequest } from '../../utilities/shopify-redirect-request.utility.js';
import { paymentAppConfigure } from '../../services/shopify/payment-app-configure.service.js';
import { MerchantService } from '../../services/database/merchant-service.database.service.js';
import { AccessTokenResponse } from '../../models/access-token-response.model.js';
import { createMechantAuthCookieHeader } from '../../utilities/create-cookie-header.utility.js';

export const redirect = async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> => {
    const prisma = new PrismaClient();
    const merchantService = new MerchantService(prisma);

    let parsedAppRedirectQuery: AppRedirectQueryParam;
    let accessTokenResponse: AccessTokenResponse;

    const redirectUrl = process.env.MERCHANT_UI_URL;
    const jwtSecretKey = process.env.JWT_SECRET_KEY;

    if (redirectUrl == null || jwtSecretKey == null) {
        return requestErrorResponse(new Error('Redirect URL or JWT secret key is not set'));
    }

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

    let merchant = await merchantService.getMerchant({ shop: shop });

    if (merchant == null) {
        return requestErrorResponse(new Error('Merchant not found'));
    }

    const updateData = {
        accessToken: accessTokenResponse.access_token,
        scopes: accessTokenResponse.scope,
    };

    try {
        merchant = await merchantService.updateMerchant(merchant, updateData);
    } catch (error) {
        return requestErrorResponse(error);
    }

    // TODO: Verify output and throw if it's bad
    // TODO: Set value to true after KYB
    const configure = await paymentAppConfigure(merchant.id, true, shop, accessTokenResponse.access_token);

    if (redirectUrl == null) {
        return requestErrorResponse(new Error('Merchant redirect location is not set'));
    }

    let merchantAuthCookieHeader: string;
    try {
        merchantAuthCookieHeader = createMechantAuthCookieHeader(merchant.id);
    } catch (error) {
        return requestErrorResponse(error);
    }

    return {
        statusCode: 301,
        headers: {
            Location: redirectUrl,
            'Content-Type': 'text/html',
            'Set-Cookie': merchantAuthCookieHeader,
        },
        body: JSON.stringify({}),
    };
};
