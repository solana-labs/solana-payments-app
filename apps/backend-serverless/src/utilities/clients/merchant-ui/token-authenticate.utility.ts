import jwt from 'jsonwebtoken';
import {
    MerchantAuthToken,
    parseAndValidateMerchantAuthToken,
} from '../../../models/clients/merchant-ui/merchant-auth-token.model.js';
import { MissingEnvError } from '../../../errors/missing-env.error.js';
import { ForbiddenError } from '../../../errors/forbidden.error.js';
import { UnauthorizedError } from '../../../errors/unauthorized.error.js';

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
        throw new UnauthorizedError();
    }

    const bearerCookie = cookies.find(cookie => cookie.startsWith('Bearer='));

    if (bearerCookie == null) {
        throw new UnauthorizedError();
    }

    const bearerToken = bearerCookie.split('Bearer=')[1];

    let decodedToken: string | jwt.JwtPayload;

    try {
        decodedToken = jwt.verify(bearerToken, jwtSecretKey);
    } catch (error) {
        throw new ForbiddenError();
    }

    let merchantAuthToken: MerchantAuthToken;

    try {
        merchantAuthToken = parseAndValidateMerchantAuthToken(decodedToken);
    } catch {
        throw new ForbiddenError();
    }

    // TODO: Validate the contents of merchantAuthToken response

    return merchantAuthToken;
};
