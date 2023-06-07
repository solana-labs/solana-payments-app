import jwt from 'jsonwebtoken';
import {
    MerchantAuthToken,
    parseAndValidateMerchantAuthToken,
} from '../../../models/clients/merchant-ui/merchant-auth-token.model.js';

export const withAuth = (cookies: string[] | undefined): MerchantAuthToken => {
    const jwtSecretKey = process.env.JWT_SECRET_KEY;
    const useAuthMock = process.env.USE_AUTH_MOCK;
    console.log('inside withauth');

    console.log('useAuthMock', useAuthMock);
    if (useAuthMock !== null && useAuthMock !== undefined) {
        const payload = {
            id: useAuthMock,
            iat: Math.floor(Date.now() / 1000),
            exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24,
        };
        return parseAndValidateMerchantAuthToken(payload);
    }

    console.log('going to out of mock');
    console.log('jwtSecretKey', jwtSecretKey);

    if (jwtSecretKey == null) {
        throw new Error('JWT secret key is not set');
    }

    console.log('after jwtSecretKey check');
    console.log('any cookis', cookies);

    if (cookies == null || cookies.length === 0) {
        throw new Error('Failed to find a cookie');
    }

    console.log('getting cookie', cookies);
    const bearerCookie = cookies.find(cookie => cookie.startsWith('Bearer='));

    console.log('got cookie', bearerCookie);

    if (bearerCookie == null) {
        throw new Error('Failed to find a cookie');
    }

    const bearerToken = bearerCookie.split('Bearer=')[1];

    const decodedToken = jwt.verify(bearerToken, jwtSecretKey);

    console.log(decodedToken);

    let merchantAuthToken: MerchantAuthToken;

    try {
        merchantAuthToken = parseAndValidateMerchantAuthToken(decodedToken);
    } catch {
        throw new Error('Failed to parse and validate merchant auth token');
    }

    // TODO: Validate the contents of merchantAuthToken response

    return merchantAuthToken;
};
