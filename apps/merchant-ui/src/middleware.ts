import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

// https://en.wikipedia.org/wiki/List_of_ISO_3166_country_codes
const comprehensivelySanctionedCountries = ['CU', 'IR', 'KP', 'RU', 'SY', 'UA'];
const ofacSanctionedCountries = ['BA', 'BY', 'MM', 'CF', 'CD', 'ET', 'HK', 'IQ', 'LB', 'LY', 'SD', 'VE', 'YE', 'ZW'];
const otherCountries = ['AF', 'BY', 'MM', 'CF', 'CN', 'CI', 'CU', 'CD', 'CY', 'ER', 'HT'];
const otherCountries2 = ['IR', 'IQ', 'LB', 'LR', 'LY', 'KP', 'SO', 'SS', 'LK', 'SD', 'SY', 'VE', 'VN', 'ZW'];

const isBlockedGeo = (request: NextRequest): boolean => {
    if (process.env.NODE_ENV === 'development') {
        return false;
    }

    const geo = request.geo;

    if (geo == null) {
        return true;
    }

    const country = geo.country;

    if (country == null) {
        return true;
    }

    if (comprehensivelySanctionedCountries.includes(country)) {
        return true;
    }

    // if (country === 'US' && geo.region === 'NY') {
    //     return true;
    // }

    if (ofacSanctionedCountries.includes(country)) {
        return true;
    }

    if (otherCountries.includes(country)) {
        return true;
    }

    if (otherCountries2.includes(country)) {
        return true;
    }

    return false;
};

export function middleware(request: NextRequest) {
    if (
        request.nextUrl.pathname.startsWith('/public/images/') ||
        request.nextUrl.pathname.startsWith('/_next/static/') ||
        request.nextUrl.pathname.startsWith('/_next/image/') ||
        request.nextUrl.pathname.startsWith('/favicon.ico') ||
        request.nextUrl.pathname.endsWith('.png') ||
        request.nextUrl.pathname.endsWith('.svg')
    ) {
        return NextResponse.next();
    }

    const isBlocked = isBlockedGeo(request);
    // const isLoggedIn = request.cookies.has('Bearer');
    // const shouldLock = !isLoggedIn && process.env.NEXT_PUBLIC_NODE_ENV === 'production';

    // console.log('isLoggedin', isLoggedIn, 'shouldLock', shouldLock);

    const geo = request.geo;

    if (geo) {
        request.nextUrl.searchParams.set('country', geo.country ?? 'unknown');
    }

    // if (shouldLock) {
    //     request.nextUrl.searchParams.set('isLoggedIn', 'false');
    // }

    request.nextUrl.searchParams.set('isBlocked', isBlocked.toString());

    if (isBlocked && request.nextUrl.pathname !== '/') {
        request.nextUrl.pathname = '/';
        return NextResponse.redirect(request.nextUrl);
    }

    return NextResponse.rewrite(request.nextUrl);
}
