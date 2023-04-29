import { PrismaClient } from '@prisma/client'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { AppInstallQueryParam } from '../models/install-query-params.model'
import { requestErrorResponse } from '../utilities/request-response.utility'
import {
    verifyAndParseShopifyInstallRequest,
    createShopifyOAuthGrantRedirectUrl,
} from '../utilities/shopify-install-request.utility'

export const install = async (
    event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
    let parsedAppInstallQuery: AppInstallQueryParam

    const prisma = new PrismaClient()

    try {
        parsedAppInstallQuery = await verifyAndParseShopifyInstallRequest(
            event.queryStringParameters
        )
    } catch (error: unknown) {
        return requestErrorResponse(error)
    }

    const shop = parsedAppInstallQuery.shop

    try {
        const merchant = await prisma.merchant.findUnique({
            where: {
                shop: shop,
            },
        })

        const newNonce = 'a'

        if (merchant == null) {
            await prisma.merchant.create({
                data: {
                    shop: shop,
                    lastNonce: newNonce,
                },
            })
        } else {
            await prisma.merchant.update({
                where: {
                    shop: shop,
                },
                data: {
                    lastNonce: newNonce,
                },
            })
        }
    } catch (error: unknown) {
        return requestErrorResponse(error)
    }

    const redirectUrl = createShopifyOAuthGrantRedirectUrl(shop, shop)

    return {
        statusCode: 302,
        headers: {
            Location: redirectUrl,
            'Content-Type': 'text/html',
        },
        body: JSON.stringify(
            {
                message: 'Redirecting..',
            },
            null,
            2
        ),
    }
}
