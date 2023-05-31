import { PrismaClient } from '@prisma/client';
import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { AppRedirectQueryParam } from '../../models/shopify/redirect-query-params.model.js';
import { fetchAccessToken } from '../../services/fetch-access-token.service.js';
import { requestErrorResponse } from '../../utilities/request-response.utility.js';
import { verifyRedirectParams } from '../../utilities/shopify-redirect-request.utility.js';
import { MerchantService } from '../../services/database/merchant-service.database.service.js';
import { AccessTokenResponse } from '../../models/shopify/access-token-response.model.js';
import { createMechantAuthCookieHeader } from '../../utilities/create-cookie-header.utility.js';
import axios from 'axios';
import { makePaymentAppConfigure } from '../../services/shopify/payment-app-configure.service.js';
import { ErrorMessage, ErrorType, errorResponse } from '../../utilities/responses/error-response.utility.js';

export const redirect = async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> => {
    const prisma = new PrismaClient();
    const merchantService = new MerchantService(prisma);

    let parsedAppRedirectQuery: AppRedirectQueryParam;
    let accessTokenResponse: AccessTokenResponse;

    const redirectUrl = process.env.MERCHANT_UI_URL;
    const jwtSecretKey = process.env.JWT_SECRET_KEY;

    if (redirectUrl == null || jwtSecretKey == null) {
        return errorResponse(ErrorType.internalServerError, ErrorMessage.missingEnv);
    }

    try {
        parsedAppRedirectQuery = await parseAndValidateAppRedirectQueryParams(event.queryStringParameters);
    } catch (error) {
        return errorResponse(ErrorType.badRequest, ErrorMessage.invalidRequestParameters);
    }

    try {
        await verifyRedirectParams(parsedAppRedirectQuery, prisma);
    } catch (error) {
        return errorResponse(ErrorType.badRequest, ErrorMessage.invalidRequestParameters);
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
        return errorResponse(ErrorType.notFound, ErrorMessage.unknownMerchant);
    }

    const updateData = {
        accessToken: accessTokenResponse.access_token,
        scopes: accessTokenResponse.scope,
    };

    try {
        merchant = await merchantService.updateMerchant(merchant, updateData);
    } catch (error) {
        return errorResponse(ErrorType.internalServerError, ErrorMessage.internalServerError);
    }

    // TODO: Set value to true after KYB, this will change once we implement KYB
    // TODO: Update merchant record to reflect status
    const paymentAppConfigure = makePaymentAppConfigure(axios);

    // TODO: Make this dynamic
    const isReady = true;

    try {
        const appConfigureResponse = await paymentAppConfigure(
            merchant.id,
            isReady,
            shop,
            accessTokenResponse.access_token
        );

        // TODO: Verify the response and throw if it's bad

        // TODO: Update merchant record to reflect status
    } catch (error) {
        try {
            await sendPaymentAppConfigureRetryMessage(merchant.id, isReady, shop, accessTokenResponse.access_token);
        } catch (error) {
            // If this fails we should log a critical error but it's not the end of the world, it just means that we have an issue sending retry messages
            // We should eventually have some kind of redundant system here but for now we can just send the user back to the merchant ui
            // in a state that is logged in but not fully set up with Shopify
            // TODO: Handle this better
            // TODO: Log critical error
        }
    }

    let merchantAuthCookieHeader: string;
    try {
        merchantAuthCookieHeader = createMechantAuthCookieHeader(merchant.id);
    } catch (error) {
        return errorResponse(ErrorType.internalServerError, ErrorMessage.internalServerError);
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
function sendPaymentAppConfigureRetryMessage(id: string, arg1: boolean, shop: string, access_token: string) {
    throw new Error('Function not implemented.');
}
