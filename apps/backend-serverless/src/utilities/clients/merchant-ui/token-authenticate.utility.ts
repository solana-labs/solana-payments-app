import jwt from 'jsonwebtoken';
import {
    MerchantAuthToken,
    parseAndValidateMerchantAuthToken,
} from '../../../models/clients/merchant-ui/merchant-auth-token.model.js';
import { last } from 'lodash';
import { MissingEnvError } from '../../../errors/missing-env.error.js';
import { UnauthorizedRequestError } from '../../../errors/unauthorized-request.error.js';

export const withAuth = (cookies: string[] | undefined): MerchantAuthToken => {
    const jwtSecretKey = process.env.JWT_SECRET_KEY;
    const useAuthMock = process.env.USE_AUTH_MOCK;

    if (useAuthMock !== null && useAuthMock !== undefined) {
        const payload = {
            id: useAuthMock,
            iat: Math.floor(Date.now() / 1000),
            exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24,
        };
        return parseAndValidateMerchantAuthToken(payload);
    }

    if (jwtSecretKey == null) {
        throw new MissingEnvError('jwt secret');
    }

    if (cookies == null || cookies.length === 0) {
        throw new UnauthorizedRequestError('did not include cookies');
    }

    const bearerCookie = cookies.find(cookie => cookie.startsWith('Bearer='));

    if (bearerCookie == null) {
        throw new UnauthorizedRequestError('did not include bearer cookie');
    }

    const bearerToken = bearerCookie.split('Bearer=')[1];

    const decodedToken = jwt.verify(bearerToken, jwtSecretKey);

    let merchantAuthToken: MerchantAuthToken;

    try {
        merchantAuthToken = parseAndValidateMerchantAuthToken(decodedToken);
    } catch {
        throw new UnauthorizedRequestError('bearer cookie did not decode correctly');
    }

    const currentTimestamp = Math.floor(Date.now() / 1000);

    if (merchantAuthToken.exp < currentTimestamp) {
        throw new UnauthorizedRequestError('token has expired');
    }

    return merchantAuthToken;
};

export const verifyShopifySignedCookie = (cookies: string[] | undefined, lastNonce: string) => {
    const jwtSecretKey = process.env.JWT_SECRET_KEY;

    if (jwtSecretKey == null) {
        throw new Error('JWT secret key is not set.');
    }

    if (cookies == null || cookies.length === 0) {
        throw new Error('Failed to find a cookie');
    }

    const nonceCookie = cookies.find(cookie => cookie.startsWith('nonce='));

    if (nonceCookie == null) {
        throw new Error('Failed to find a cookie');
    }

    const nonceToken = nonceCookie.split('nonce=')[1];

    const decodedToken = jwt.verify(nonceToken, jwtSecretKey);

    if (decodedToken != lastNonce) {
        throw new Error('Last nonce does not match');
    }
};
