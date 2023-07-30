import jwt from 'jsonwebtoken';
import { ForbiddenError } from '../../errors/forbidden.error.js';
import { MissingEnvError } from '../../errors/missing-env.error.js';
import { UnauthorizedRequestError } from '../../errors/unauthorized-request.error.js';
import {
    MerchantAuthToken,
    parseAndValidateMerchantAuthToken,
} from '../../models/clients/merchant-ui/merchant-auth-token.model.js';

export const withAuth = (cookies: string[] | undefined): MerchantAuthToken => {
    const jwtSecretKey = process.env.JWT_SECRET_KEY;
    const useAuthMock = process.env.USE_AUTH_MOCK;

    if (jwtSecretKey == null) {
        throw new MissingEnvError('Missing jwt secret');
    }

    let merchantAuthToken: MerchantAuthToken;
    let decodedToken: string | jwt.JwtPayload;

    if (cookies != null && cookies.length > 0) {
        const bearerCookie = cookies.find(cookie => cookie.startsWith('Bearer='));

        if (bearerCookie == null) {
            throw new UnauthorizedRequestError('Did not include bearer cookie');
        }

        const bearerToken = bearerCookie.split('Bearer=')[1];

        try {
            decodedToken = jwt.verify(bearerToken, jwtSecretKey);
        } catch (error) {
            throw new ForbiddenError();
        }

        try {
            merchantAuthToken = parseAndValidateMerchantAuthToken(decodedToken);
        } catch {
            throw new UnauthorizedRequestError('Bearer cookie did not decode correctly');
        }

        const currentTimestamp = Math.floor(Date.now() / 1000);

        if (merchantAuthToken.exp < currentTimestamp) {
            throw new UnauthorizedRequestError('Token has expired');
        }
    } else {
        if (useAuthMock !== null && useAuthMock !== undefined) {
            const payload = {
                id: useAuthMock,
                iat: Math.floor(Date.now() / 1000),
                exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24,
            };
            merchantAuthToken = parseAndValidateMerchantAuthToken(payload);
        } else {
            throw new UnauthorizedRequestError('Did not include cookies or useAuthMock');
        }
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

    let decodedToken: string | jwt.JwtPayload;

    try {
        decodedToken = jwt.verify(nonceToken, jwtSecretKey);
    } catch (error) {
        throw new ForbiddenError();
    }

    if (decodedToken != lastNonce) {
        throw new Error('Last nonce does not match');
    }
};
