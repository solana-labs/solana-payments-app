import { PrismaClient } from '@prisma/client'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { AppRedirectQueryParam } from '../models/redirect-query-params.model'
import { fetchAccessToken } from '../services/fetch-access-token.service'
import { requestErrorResponse } from '../utilities/request-response.utility'
import { verifyAndParseShopifyRedirectRequest } from '../utilities/shopify-redirect-request.utility'
import { paymentAppConfigure } from '../services/payment-app-configure.service'

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

    await paymentAppConfigure(
        'greatMerchant123',
        false,
        shop,
        accessTokenResponse.access_token
    )

    const redirectUrl = `https://www.apple.com/`

    return {
        statusCode: 302,
        headers: {
            Location: redirectUrl,
            'Content-Type': 'text/html',
        },
        body: JSON.stringify(
            {
                message: 'Redirect! Redirect! Redirect!',
            },
            null,
            2
        ),
    }
}
