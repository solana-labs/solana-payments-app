import jwt from 'jsonwebtoken';

export const AUTH_TOKEN_COOKIE_NAME = 'Bearer';

interface CookieOptions {
    maxAge: number;
    httpOnly: boolean;
    secure: boolean;
    sameSite: 'strict' | 'lax' | 'none';
    path: string;
}

export const createMechantAuthCookieHeader = (id: string): string => {
    const jwtSecretKey = process.env.JWT_SECRET_KEY;

    if (jwtSecretKey == null) {
        throw new Error('JWT secret key is not set');
    }

    const payload = {
        id: id,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24,
    };

    const token = jwt.sign(payload, jwtSecretKey, {});

    const cookieOptions: CookieOptions = {
        maxAge: 24 * 60 * 60, // 1 day in seconds
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
    };

    return `${AUTH_TOKEN_COOKIE_NAME}=${token}; Max-Age=${cookieOptions.maxAge}; ${
        cookieOptions.httpOnly ? 'HttpOnly;' : ''
    } SameSite=${cookieOptions.sameSite}; ${cookieOptions.secure ? ' Secure;' : ''} Path=${cookieOptions.path};`;
};
