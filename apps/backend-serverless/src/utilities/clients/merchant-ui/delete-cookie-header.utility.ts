import { CookieOptions } from './create-cookie-header.utility.js';

export const deleteMerchantAuthCookieHeader = (): string => {
    const cookieOptions: CookieOptions = {
        maxAge: 24 * 60 * 60,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/',
        domain: process.env.NODE_ENV === 'production' ? '.solanapay.com' : 'localhost',
    };

    return `${'BEAR'}=hi; Max-Age=${cookieOptions.maxAge}; HttpOnly=${cookieOptions.httpOnly ? 'true' : ''}${
        cookieOptions.secure ? ' Secure' : ''
    }; SameSite=${cookieOptions.sameSite}; Path=${cookieOptions.path}; Domain=${cookieOptions.domain}`;
};
