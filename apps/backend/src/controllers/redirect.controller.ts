import { Request, Response } from 'express'
import {
    AppRedirectQueryParam,
    appRedirectQueryParmSchema,
} from '../models/redirect-query-params.model'
import { fetchAccessToken } from '../services/access-token.service'
import { verifyShopifyRedirectRequest } from '../services/verify-requests/verify-shopify-redirect-request'
import { prisma } from '../..'
import { setShopifyAccessTokenForShop } from '../services/database/shopify'

export const redirectController = async (
    request: Request,
    response: Response
) => {
    // Verify the security of the request given to install the shopify app
    try {
        await verifyShopifyRedirectRequest(request.query)
    } catch (error: unknown) {
        if (error instanceof Error) {
            // redirect to error state
        }
        return
    }

    // Parse the request for the inputs
    try {
        var parsedAppRedirectQuery: AppRedirectQueryParam =
            appRedirectQueryParmSchema.cast(
                request.query
            ) as AppRedirectQueryParam
    } catch (error: unknown) {
        if (error instanceof Error) {
            // redirect to error state
        }
        return
    }

    const shop = parsedAppRedirectQuery.shop
    const code = parsedAppRedirectQuery.code

    try {
        var accessTokenResponse = await fetchAccessToken(shop, code)
    } catch (error: unknown) {
        if (error instanceof Error) {
            // redirect to error state
        }
        return
    }

    // check the scopes are what we need, save the scopes
    const parsedScopes = accessTokenResponse.scope.split(',')
    const writePaymentGayewaysScope = parsedScopes.includes(
        'write_payment_gateways'
    )
    const writePaymentSessionsScope = parsedScopes.includes(
        'write_payment_sessions'
    )

    if (!writePaymentGayewaysScope || !writePaymentSessionsScope) {
        // this is an issue because we need these scopes
        // but i'm not sure if we redirect to error or just block functionality
    }

    // Save out access token
    await setShopifyAccessTokenForShop(shop, accessTokenResponse.access_token)

    console.log('shop ' + shop)
    console.log('access token ' + accessTokenResponse.access_token)

    response.redirect('http://localhost:3000/sucess?shop=some_shop_name')
}
