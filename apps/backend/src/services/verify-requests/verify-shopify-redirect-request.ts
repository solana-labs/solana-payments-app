import {
    AppRedirectQueryParam,
    appRedirectQueryParmSchema,
} from '../../models/redirect-query-params.model'
import queryString from 'query-string'
import crypto from 'crypto-js'

export const verifyShopifyRedirectRequest = async (appRedirectQuery: any) => {
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
