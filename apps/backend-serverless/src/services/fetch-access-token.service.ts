import axios from 'axios';
import { accessTokenEndpoint } from '../utilities/transaction-request/endpoints.utility.js';
import {
    AccessTokenResponse,
    parseAndValidateAccessTokenResponse,
} from '../models/shopify/access-token-response.model.js';

export const fetchAccessToken = async (shop: string, authCode: string) => {
    const endpoint = accessTokenEndpoint(shop, authCode);
    const headers = {
        'Content-Type': 'application/json',
        'Accept-Encoding': '',
    };
    const response = await axios({
        url: endpoint,
        method: 'POST',
        headers: headers,
    });

    if (response.status != 200) {
        throw new Error('Error requesting access token.');
    }

    let accessTokenResponse: AccessTokenResponse;

    try {
        accessTokenResponse = parseAndValidateAccessTokenResponse(response.data);
    } catch {
        throw new Error('Could not get access token from Shopify.');
    }

    return accessTokenResponse;
};
