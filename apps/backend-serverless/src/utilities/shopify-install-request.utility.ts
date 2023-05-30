import {
    AppInstallQueryParam,
    parseAndValidateAppInstallQueryParms,
} from '../models/shopify/install-query-params.model.js';
import crypto from 'crypto-js';
import { stringifyParams } from './stringify-params.utility.js';

export const verifyAndParseShopifyInstallRequest = (appInstallQuery: unknown): AppInstallQueryParam => {
    // Verify that the object passed in can be parsed into an AppInstallQueryParam object

    let parsedAppInstallQuery: AppInstallQueryParam;

    try {
        parsedAppInstallQuery = parseAndValidateAppInstallQueryParms(appInstallQuery);
    } catch (error) {
        if (error instanceof Error) {
            throw error;
        } else {
            throw new Error('Could not parse the app install query. Unknown Reason.');
        }
    }

    // Save the hmac, remove it from the object, get the query string after removing
    const hmac = parsedAppInstallQuery.hmac;

    if (hmac == undefined) {
        throw new Error('Did not find the required info to verify.');
    }

    delete parsedAppInstallQuery['hmac'];
    const queryStringAfterRemoving = stringifyParams(parsedAppInstallQuery);

    const secret = process.env.SHOPIFY_SECRET_KEY;

    // Check for a secret key to decode with
    if (secret == undefined) {
        throw new Error('Did not have the required info to verify.');
    }

    const digest = crypto.HmacSHA256(queryStringAfterRemoving, secret);
    const digestString = digest.toString();

    if (digestString != hmac) {
        throw new Error(queryStringAfterRemoving);
    }

    return parsedAppInstallQuery;
};

// redirect url specified here: https://shopify.dev/apps/auth/oauth/getting-started#redirect-to-the-grant-screen-using-a-3xx-redirect
export const createShopifyOAuthGrantRedirectUrl = (shop: string, nonce: string) => {
    const clientId = process.env.SHOPIFY_CLIENT_ID;
    const BASE_URL = process.env.BASE_URL;
    const redirectUrl = BASE_URL + '/redirect';
    return `https://${shop}/admin/oauth/authorize?client_id=${clientId}&scope=${createScopeString([
        ShopifyScope.WRITE_PAYMENT_GATEWAYS,
        ShopifyScope.WRITE_PAYMENT_SESSIONS,
    ])}&redirect_uri=${redirectUrl}&state=${nonce}`;
};

// all scopes are listed here: https://shopify.dev/api/usage/access-scopes#authenticated-access-scopes
export const createScopeString = (scopes: ShopifyScope[]) => {
    return scopes.map(scope => scope.toString()).join(',');
};

export enum ShopifyScope {
    WRITE_PAYMENT_GATEWAYS = 'write_payment_gateways',
    WRITE_PAYMENT_SESSIONS = 'write_payment_sessions',
}
