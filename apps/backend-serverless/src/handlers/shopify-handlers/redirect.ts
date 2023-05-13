import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { AppRedirectQueryParam } from '../../models/redirect-query-params.model.js';
import { fetchAccessToken } from '../../services/fetch-access-token.service.js';
import { requestErrorResponse } from '../../utilities/request-response.utility.js';
import { verifyAndParseShopifyRedirectRequest } from '../../utilities/shopify-redirect-request.utility.js';
import { paymentAppConfigure } from '../../services/shopify/payment-app-configure.service.js';
import { MerchantService } from '../../services/database/merchant-service.database.service.js';
import { AccessTokenResponse } from '../../models/access-token-response.model.js';
import { AUTH_TOKEN_COOKIE_NAME, createCookieHeader } from '../../utilities/create-cookie-header.utility.js';

export const redirect = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const id = 'merchantid';

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

    // TODO: Verify output and throw if it's bad
    const configure = await paymentAppConfigure('greatMerchant123', true, shop, accessTokenResponse.access_token);

    if (redirectUrl == null) {
        return requestErrorResponse(new Error('Merchant redirect location is not set'));
    }

    const token = jwt.sign({ id }, jwtSecretKey, {
        expiresIn: '1d',
    });

    return {
        statusCode: 301,
        headers: {
            Location: redirectUrl,
            'Content-Type': 'text/html',
            'Set-Cookie': createCookieHeader(AUTH_TOKEN_COOKIE_NAME, token),
        },
        body: JSON.stringify({}),
    };
};
