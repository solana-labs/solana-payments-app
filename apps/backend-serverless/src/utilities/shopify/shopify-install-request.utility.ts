import crypto from 'crypto';
import { MissingEnvError } from '../../errors/missing-env.error.js';
import { UnauthorizedRequestError } from '../../errors/unauthorized-request.error.js';
import {
    AppInstallQueryParam,
    parseAndValidateAppInstallQueryParms,
} from '../../models/shopify/install-query-params.model.js';
import { stringifyParams } from './stringify-params.utility.js';

export const verifyAndParseShopifyInstallRequest = (appInstallQuery: unknown): AppInstallQueryParam => {
    let parsedAppInstallQuery: AppInstallQueryParam;

    try {
        parsedAppInstallQuery = parseAndValidateAppInstallQueryParms(appInstallQuery);
    } catch (error) {
        throw new UnauthorizedRequestError('could not parse the query parameters.');
    }

    if (!parsedAppInstallQuery.hmac) {
        throw new UnauthorizedRequestError('Request did not include hmac.');
    }

    const hmac = parsedAppInstallQuery.hmac;
    delete parsedAppInstallQuery['hmac'];

    const secret = process.env.SHOPIFY_SECRET_KEY;
    if (secret == undefined) {
        throw new MissingEnvError('shopify secret');
    }

    const hmacGenerated = crypto
        .createHmac('sha256', secret)
        .update(Buffer.from(stringifyParams(parsedAppInstallQuery)))
        .digest('hex');

    if (hmacGenerated != hmac) {
        throw new UnauthorizedRequestError('hmac did not match. install ' + JSON.stringify(parsedAppInstallQuery));
    }

    return parsedAppInstallQuery;
};

// redirect url specified here: https://shopify.dev/apps/auth/oauth/getting-started#redirect-to-the-grant-screen-using-a-3xx-redirect
export const createShopifyOAuthGrantRedirectUrl = (shop: string, nonce: string) => {
    const clientId = process.env.SHOPIFY_CLIENT_ID;
    const BACKEND_URL = process.env.BACKEND_URL;
    const redirectUrl = BACKEND_URL + '/redirect';
    return `https://${shop}/admin/oauth/authorize?client_id=${clientId}&scope=${createScopeString([
        ShopifyScope.WRITE_PAYMENT_GATEWAYS,
        ShopifyScope.WRITE_PAYMENT_SESSIONS,
        ShopifyScope.READ_PRODUCTS,
        ShopifyScope.READ_PRODUCTS_LISTING,
    ])}&redirect_uri=${redirectUrl}&state=${nonce}`;
};

// all scopes are listed here: https://shopify.dev/api/usage/access-scopes#authenticated-access-scopes
export const createScopeString = (scopes: ShopifyScope[]) => {
    return scopes.map(scope => scope.toString()).join(',');
};

export enum ShopifyScope {
    WRITE_PAYMENT_GATEWAYS = 'write_payment_gateways',
    WRITE_PAYMENT_SESSIONS = 'write_payment_sessions',
    READ_PRODUCTS = 'read_products',
    READ_PRODUCTS_LISTING = 'read_product_listings',
}
