import { CookieOptions } from './create-cookie-header.utility.js';

export const deleteMerchantAuthCookieHeader = (): string => {
    const domain = process.env.NODE_ENV === 'development' ? 'localhost' : '.solanapay.com';

    const cookieOptions: CookieOptions = {
        maxAge: 0,
        httpOnly: true,
        secure: process.env.NODE_ENV != 'development',
        sameSite: 'strict',
        path: '/',
        domain: domain,
    };

    return `${'Bearer'}=; Max-Age=${cookieOptions.maxAge}; HttpOnly=${cookieOptions.httpOnly ? 'true' : ''};${
        cookieOptions.secure ? ' Secure' : ''
    };  SameSite=${cookieOptions.sameSite}; Path=${cookieOptions.path}; Domain=${cookieOptions.domain};`;
};
