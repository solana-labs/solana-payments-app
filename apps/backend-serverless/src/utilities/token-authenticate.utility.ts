import jwt from 'jsonwebtoken';
import { MerchantAuthToken, parseAndValidateMerchantAuthToken } from '../models/merchant-auth-token.model.js';
import { APIGatewayProxyEventV2 } from 'aws-lambda';

export const withAuth = (event: APIGatewayProxyEventV2): MerchantAuthToken => {
    const cookies = event.cookies;
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
        throw new Error('JWT secret key is not set');
    }

    if (cookies == null || cookies.length === 0) {
        throw new Error('Failed to find any cookies');
    }

    const bearerCookie = cookies.find(cookie => cookie.startsWith('Bearer='));

    if (bearerCookie == null) {
        throw new Error('Failed to find bearer token');
    }

    const bearerToken = bearerCookie.split('Bearer=')[1];

    const decodedToken = jwt.verify(bearerToken, jwtSecretKey);

    let merchantAuthToken: MerchantAuthToken;

    try {
        merchantAuthToken = parseAndValidateMerchantAuthToken(decodedToken);
    } catch {
        throw new Error('Failed to parse and validate merchant auth token');
    }

    // TODO: Validate the contents of merchantAuthToken response

    return merchantAuthToken;
};
