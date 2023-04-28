// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import {
    AppRedirectQueryParam,
    appRedirectQueryParmSchema,
} from '@/models/redirect-query-params.model'
import type { NextApiRequest, NextApiResponse } from 'next'
import crypto from 'crypto-js'
import queryString from 'query-string'
import {
    AccessTokenResponse,
    accessTokenResponseSchema,
} from '@/models/access-token.model'
import axios from 'axios'
import { PrismaClient } from '@prisma/client'
import { paymentAppConfigure } from '@/services/payment-app-configure.service'

type Data = {
    name: string
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<Data>
) {
    const prisma = new PrismaClient()

    // Verify the security of the request given to install the shopify app
    try {
        await verifyShopifyRedirectRequest(req.query)
    } catch (error: unknown) {
        if (error instanceof Error) {
            res.status(500).json({ name: error.message })
        }
        return
    }

    // Parse the request for the inputs
    try {
        var parsedAppRedirectQuery: AppRedirectQueryParam =
            appRedirectQueryParmSchema.cast(req.query) as AppRedirectQueryParam
    } catch (error: unknown) {
        if (error instanceof Error) {
            res.status(500).json({ name: error.message })
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

    await prisma.merchant.update({
        where: {
            shop: shop,
        },
        data: {
            accessToken: accessTokenResponse.access_token,
            scopes: accessTokenResponse.scope,
        },
    })

    const merchantUiUrl = process.env.MERCHANT_UI_URL!

    await paymentAppConfigure(
        'greatMerchant123',
        false,
        shop,
        accessTokenResponse.access_token
    )

    res.status(200).redirect(merchantUiUrl)
}

export const verifyShopifyRedirectRequest = (appRedirectQuery: any) => {
    // Verify that the object passed in can be parsed into an AppRedirectQueryParam object
    let parsedAppRedirectQuery: AppRedirectQueryParam
    try {
        parsedAppRedirectQuery = appRedirectQueryParmSchema.cast(
            appRedirectQuery
        ) as AppRedirectQueryParam
    } catch (error) {
        throw new Error('Did not find the required info to verifyy.')
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
