import jwt from 'jsonwebtoken';

export const AUTH_TOKEN_COOKIE_NAME = 'authToken';

interface CookieOptions {
    maxAge: number;
    httpOnly: boolean;
    secure: boolean;
    sameSite: 'strict' | 'lax' | 'none';
    path: string;
}

export const createCookieHeader = (name: string, payload: any): string => {
    const jwtSecretKey = process.env.JWT_SECRET_KEY;

    if (jwtSecretKey == null) {
        throw new Error('JWT secret key is not set');
    }

    const token = jwt.sign(payload, jwtSecretKey, {
        expiresIn: '1d',
    });

    const cookieOptions: CookieOptions = {
        maxAge: 24 * 60 * 60, // 1 day in seconds
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/',
    };

    return `${name}=${token}; Max-Age=${cookieOptions.maxAge}; HttpOnly=${cookieOptions.httpOnly ? 'true' : ''}${
        cookieOptions.secure ? ' Secure' : ''
    }; SameSite=${cookieOptions.sameSite}; Path=${cookieOptions.path}`;
};
