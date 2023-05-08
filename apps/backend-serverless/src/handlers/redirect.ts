import { PrismaClient } from '@prisma/client'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { AppRedirectQueryParam } from '../models/redirect-query-params.model.js'
import { fetchAccessToken } from '../services/fetch-access-token.service.js'
import { requestErrorResponse } from '../utilities/request-response.utility.js'
import { verifyAndParseShopifyRedirectRequest } from '../utilities/shopify-redirect-request.utility.js'
import { paymentAppConfigure } from '../services/payment-app-configure.service.js'

export const redirect = async (
    event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
    const prisma = new PrismaClient()

    let parsedAppRedirectQuery: AppRedirectQueryParam

    // Verify the security of the request given to install the shopify app
    try {
        parsedAppRedirectQuery = await verifyAndParseShopifyRedirectRequest(
            event.queryStringParameters
        )
    } catch (error: unknown) {
        return requestErrorResponse(error)
    }

    const shop = parsedAppRedirectQuery.shop
    const code = parsedAppRedirectQuery.code

    try {
        var accessTokenResponse = await fetchAccessToken(shop, code)
    } catch (error: unknown) {
        return requestErrorResponse(error)
    }

    await prisma.merchant.update({
        where: {
            shop: shop,
        },
        data: {
            accessToken: accessTokenResponse.access_token,
            scopes: accessTokenResponse.scope,
        },
    })

    const configure = await paymentAppConfigure(
        'greatMerchant123',
        true,
        shop,
        accessTokenResponse.access_token
    )

    const redirectUrl = process.env.MERCHANT_UI_URL

    if (redirectUrl == null) {
        return requestErrorResponse('Merchant redirect location is not set')
    }

    return {
        statusCode: 301,
        headers: {
            Location: redirectUrl,
            'Content-Type': 'text/html',
        },
        body: JSON.stringify({}, null, 2),
    }
}
