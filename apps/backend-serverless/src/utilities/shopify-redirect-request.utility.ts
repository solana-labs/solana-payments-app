import {
    AppRedirectQueryParam,
    appRedirectQueryParmSchema,
    parseAndValidateAppRedirectQueryParams,
} from '../models/shopify/redirect-query-params.model.js';
import crypto from 'crypto-js';
import { stringifyParams } from './stringify-params.utility.js';

export const verifyAndParseShopifyRedirectRequest = (appRedirectQuery: unknown): AppRedirectQueryParam => {
    // Verify that the object passed in can be parsed into an AppRedirectQueryParam object
    let parsedAppRedirectQuery: AppRedirectQueryParam;
    try {
        parsedAppRedirectQuery = parseAndValidateAppRedirectQueryParams(appRedirectQuery);
    } catch (error) {
        throw new Error('Did not find the required info to verifyy.');
    }

    // Save the hmac, remove it from the object, get the query string after removing
    const hmac = parsedAppRedirectQuery.hmac;

    if (hmac == undefined) {
        throw new Error('Did not find the required info to verify.');
    }

    delete parsedAppRedirectQuery['hmac'];
    const queryStringAfterRemoving = stringifyParams(parsedAppRedirectQuery);

    const secret = process.env.SHOPIFY_SECRET_KEY;

    // Check for a secret key to decode with
    if (secret == undefined) {
        throw new Error('Did not have the required info to verify.');
    }

    const digest = crypto.HmacSHA256(queryStringAfterRemoving, secret);
    const digestString = digest.toString();

    if (digestString != hmac) {
        throw new Error('Did not have the correct info to verify.');
    }

    const nonce = parsedAppRedirectQuery.state;

    // TODO: validate the nonce is the same nonce from the shop we had done previously here
    if (false) {
        throw new Error('Did not have the correct info to verify.');
    }

    const shop = parsedAppRedirectQuery.shop;
    // TODO: validate the shop regex

    if (false) {
        throw new Error('Did not have the correct identity.');
    }

    return parsedAppRedirectQuery;
};
