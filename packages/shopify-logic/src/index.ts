import {
    AppInstallQueryParam,
    appInstallQueryParmSchema,
} from './models/install-query-parms.model'
import queryString from 'query-string'
import crypto from 'crypto-js'
import {
    AppRedirectQueryParam,
    appRedirectQueryParmSchema,
} from './models/redirect-query-params.model'
import axios from 'axios'
import {
    AccessTokenResponse,
    accessTokenResponseSchema,
} from './models/access-token-response.model'

export const verifyShopifyInstallRequest = (appInstallQuery: any) => {
    // Verify that the object passed in can be parsed into an AppInstallQueryParam object
    let parsedAppInstallQuery: AppInstallQueryParam =
        parseAppInstallQueryParms(appInstallQuery)

    // Save the hmac, remove it from the object, get the query string after removing
    const hmac = parsedAppInstallQuery.hmac

    if (hmac == undefined) {
        throw new Error('Did not find the required info to verify.')
    }

    delete parsedAppInstallQuery['hmac']
    const queryStringAfterRemoving = queryString.stringify(
        parsedAppInstallQuery
    )

    const secret = process.env.SHOPIFY_SECRET_KEY

    // Check for a secret key to decode with
    if (secret == undefined) {
        throw new Error('Did not have the required info to verify.')
    }

    const digest = crypto.HmacSHA256(queryStringAfterRemoving, secret)
    const digestString = digest.toString()

    if (digestString != hmac) {
        throw new Error('Did not have the correct info to verify.')
    }
}

export const parseAppInstallQueryParms = (
    appInstallQuery: any
): AppInstallQueryParam => {
    let parsedAppInstallQuery: AppInstallQueryParam
    try {
        parsedAppInstallQuery = appInstallQueryParmSchema.cast(
            appInstallQuery
        ) as AppInstallQueryParam
    } catch (error) {
        throw new Error('Did not find the required info to verify.')
    }
    return parsedAppInstallQuery
}

export const parseAppRedirectQueryParms = (
    appRedirectQuery: any
): AppRedirectQueryParam => {
    // Parse the request for the inputs
    let parsedAppRedirectQuery: AppRedirectQueryParam
    try {
        parsedAppRedirectQuery = appRedirectQueryParmSchema.cast(
            appRedirectQuery
        ) as AppRedirectQueryParam
        return parsedAppRedirectQuery
    } catch (error: unknown) {
        if (error instanceof Error) {
            throw error
        } else {
            throw new Error('Did not find the required info to verify.')
        }
    }
}

// redirect url specified here: https://shopify.dev/apps/auth/oauth/getting-started#redirect-to-the-grant-screen-using-a-3xx-redirect
export const createShopifyOAuthGrantRedirectUrl = (
    shop: string,
    nonce: string
) => {
    const clientId = process.env.SHOPIFY_CLIENT_ID
    const BASE_URL = process.env.BASE_URL
    const redirectUrl = BASE_URL + '/redirect'
    return `https://${shop}/admin/oauth/authorize?client_id=${clientId}&scope=${createScopeString(
        [
            ShopifyScope.WRITE_PAYMENT_GATEWAYS,
            ShopifyScope.WRITE_PAYMENT_SESSIONS,
        ]
    )}&redirect_uri=${redirectUrl}&state=${nonce}`
}

// all scopes are listed here: https://shopify.dev/api/usage/access-scopes#authenticated-access-scopes
export const createScopeString = (scopes: ShopifyScope[]) => {
    return scopes.map((scope) => scope.toString()).join(',')
}

export enum ShopifyScope {
    WRITE_PAYMENT_GATEWAYS = 'write_payment_gateways',
    WRITE_PAYMENT_SESSIONS = 'write_payment_sessions',
}

export const verifyShopifyRedirectRequest = (appRedirectQuery: any) => {
    // Verify that the object passed in can be parsed into an AppRedirectQueryParam object
    let parsedAppRedirectQuery: AppRedirectQueryParam
    try {
        parsedAppRedirectQuery = appRedirectQueryParmSchema.cast(
            appRedirectQuery
        ) as AppRedirectQueryParam
    } catch (error) {
        throw new Error('Did not find the required info to verify.')
    }

    // Save the hmac, remove it from the object, get the query string after removing
    const hmac = parsedAppRedirectQuery.hmac

    if (hmac == undefined) {
        throw new Error('Did not find the required info to verify.')
    }

    delete parsedAppRedirectQuery['hmac']
    const queryStringAfterRemoving = queryString.stringify(
        parsedAppRedirectQuery
    )

    const secret = process.env.SHOPIFY_SECRET_KEY

    // Check for a secret key to decode with
    if (secret == undefined) {
        throw new Error('Did not have the required info to verify.')
    }

    const digest = crypto.HmacSHA256(queryStringAfterRemoving, secret)
    const digestString = digest.toString()

    if (digestString != hmac) {
        throw new Error('Did not have the correct info to verify.')
    }

    const nonce = parsedAppRedirectQuery.state

    // TODO: validate the nonce is the same nonce from the shop we had done previously here

    if (false) {
        throw new Error('Did not have the correct info to verify.')
    }

    const shop = parsedAppRedirectQuery.shop

    // TODO: validate the shop regex

    if (false) {
        throw new Error('Did not have the correct identity.')
    }
}

export const fetchAccessToken = async (shop: string, authCode: string) => {
    const endpoint = accessTokenEndpoint(shop, authCode)
    const headers = {
        'Content-Type': 'application/json',
        'Accept-Encoding': '',
    }
    const response = await axios({
        url: endpoint,
        method: 'POST',
        headers: headers,
    })

    if (response.status != 200) {
        throw new Error('Error requesting access token.')
    }

    try {
        var accessTokenResponse = accessTokenResponseSchema.cast(
            response.data
        ) as AccessTokenResponse
    } catch {
        throw new Error('Could not get access token from Shopify.')
    }

    return accessTokenResponse
}

// url to request access token as described here: https://shopify.dev/apps/auth/oauth/getting-started#step-5-get-an-access-token
export const accessTokenEndpoint = (shop: string, authCode: string) => {
    const clientId = process.env.SHOPIFY_CLIENT_ID
    const clientSecret = process.env.SHOPIFY_SECRET_KEY
    return `https://${shop}/admin/oauth/access_token?client_id=${clientId}&client_secret=${clientSecret}&code=${authCode}`
}
