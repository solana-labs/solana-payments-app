import jwt from 'jsonwebtoken';
import { MissingEnvError } from '../../errors/missing-env.error.js';

export const AUTH_TOKEN_COOKIE_NAME = 'Bearer';

export interface CookieOptions {
    maxAge: number;
    httpOnly: boolean;
    secure: boolean;
    sameSite: 'strict' | 'lax' | 'none';
    path: string;
    domain: string;
}

export const createMechantAuthCookieHeader = (id: string): string => {
    const jwtSecretKey = process.env.JWT_SECRET_KEY;

    if (jwtSecretKey == null) {
        throw new MissingEnvError('jwt secret key');
    }

    const payload = {
        id: id,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24,
    };

    const token = jwt.sign(payload, jwtSecretKey, {});

    const domain = process.env.NODE_ENV === 'development' ? 'localhost' : '.solanapay.com';

    const cookieOptions: CookieOptions = {
        maxAge: 24 * 60 * 60, // 1 day in seconds
        httpOnly: true,
        secure: process.env.NODE_ENV != 'development',
        sameSite: 'strict',
        path: '/',
        domain: domain,
    };

    return `${AUTH_TOKEN_COOKIE_NAME}=${token}; Max-Age=${cookieOptions.maxAge}; HttpOnly=${
        cookieOptions.httpOnly ? 'true' : ''
    }${cookieOptions.secure ? ' Secure' : ''}; SameSite=${cookieOptions.sameSite}; Path=${cookieOptions.path}; Domain=${
        cookieOptions.domain
    }`;
};

export const createSignedShopifyCookie = (cookie: string): string => {
    const jwtSecretKey = process.env.JWT_SECRET_KEY;

    if (jwtSecretKey == null) {
        throw new MissingEnvError('jwt secret key');
    }

    const signedCookie = jwt.sign(cookie, jwtSecretKey, {});

    return signedCookie;
};

export const decodeSignedCookie = (signedCookie: string): string => {
    const jwtSecretKey = process.env.JWT_SECRET_KEY;

    if (jwtSecretKey == null) {
        throw new MissingEnvError('jwt secret key');
    }

    const cookie = jwt.verify(signedCookie, jwtSecretKey, {});

    return cookie as string;
};
