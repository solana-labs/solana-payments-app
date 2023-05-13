import jwt from 'jsonwebtoken';
import { MerchantAuthToken, parseAndValidateMerchantAuthToken } from '../models/merchant-auth-token.model.js';

export const withAuth = (cookies: string[] | undefined): MerchantAuthToken => {
    const jwtSecretKey = process.env.JWT_SECRET_KEY;

    if (jwtSecretKey == null) {
        throw new Error('JWT secret key is not set');
    }

    if (cookies == null || cookies.length === 0) {
        throw new Error('Failed to find a cookie');
    }

    const bearerCookie = cookies.find(cookie => cookie.startsWith('Bearer='));

    if (bearerCookie == null) {
        throw new Error('Failed to find a cookie');
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
