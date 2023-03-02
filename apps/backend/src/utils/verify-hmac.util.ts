// import {
//     AppInstallQueryParam,
//     appInstallQueryParmSchema,
// } from '../models/install-query-parms.model'
// import queryString from 'query-string'
// import crypto from 'crypto-js'
// import { AppRedirectQuery } from '../models/redirect-query-params.model'

// export const parseAndVerifyRequestQuery = async (
//     appInstallQuery: any
// ): Promise<AppInstallQueryParam> => {
//     // Verify that the object passed in can be parsed into an AppInstallQueryParam object
//     let parsedAppInstallQuery: AppInstallQueryParam
//     try {
//         parsedAppInstallQuery = appInstallQueryParmSchema.cast(
//             appInstallQuery
//         ) as AppInstallQueryParam
//     } catch (error) {
//         throw error as Error
//     }

//     // Save the hmac, remove it from the object, get the query string after removing
//     const hmac = parsedAppInstallQuery.hmac
//     delete parsedAppInstallQuery['hmac']
//     const queryStringAfterRemoving = queryString.stringify(
//         parsedAppInstallQuery
//     )

//     const secret = process.env.SHOPIFY_SECRET_KEY

//     // Check for a secret key to decode with
//     if (secret == undefined) {
//         throw new Error('undefined secret key in .env')
//     }

//     const digest = crypto.HmacSHA256(queryStringAfterRemoving, secret)
//     const digestString = digest.toString()

//     if (digestString != hmac) {
//         throw new Error('insecure hmac provided')
//     }

//     return parsedAppInstallQuery
// }

// export const verifyHmacForOAuth = async (redirectQuery: AppRedirectQuery) => {
//     // Verify that we have a secret key in our enviorment
//     const secret = process.env.SHOPIFY_SECRET_KEY

//     if (secret == undefined) {
//         throw new Error('undefined secret key in .env')
//     }

//     // Save the hmac, remove it from the object, get the query string after removing
//     const hmac = redirectQuery.hmac
//     delete redirectQuery['hmac']
//     const queryStringAfterRemoving = queryString.stringify(redirectQuery)

//     const digest = crypto.HmacSHA256(queryStringAfterRemoving, secret)
//     const digestString = digest.toString()

//     if (digestString != hmac) {
//         throw new Error('insecure hmac provided')
//     }
// }
