import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

// The country to block from accessing the secret page
const BLOCKED_COUNTRY = 'US';

// Trigger this middleware to run on the `/secret-page` route
// export const config = {
//     matcher: '/.*',
// };

const hardBlockCountries = ['CU', 'IR', 'KP', 'RU', 'SY', 'US'];
const hardBlockUkraine = ['crimea', 'donetsk', 'luhansk'];

const isBlockedGeo = (request: NextRequest): boolean => {
    if (process.env.NODE_ENV === 'development') {
        return false;
    }

    const geo = request.geo;

    if (geo == null) {
        return true;
    }

    const country = geo.country;
    console.log('country', country);

    if (country == null) {
        return true;
    }

    if (hardBlockCountries.includes(country)) {
        return true;
    }

    return false;
};

export function middleware(request: NextRequest) {
    const isBlocked = isBlockedGeo(request);
    const geo = request.geo;

    console.log('request', request);
    console.log('geo', request.geo);

    if (geo) {
        request.nextUrl.searchParams.set('country', geo.country ?? 'unknown');
    }

    console.log('after geo', request.nextUrl);

    // const newUrl = new URL('/', request.url);
    // console.log('new url', newUrl, newUrl.toString());
    console.log('url stuff', request.nextUrl.origin, request.nextUrl.pathname.toLowerCase());
    request.nextUrl.searchParams.set('isBlocked', isBlocked.toString());

    if (isBlocked && request.nextUrl.pathname !== '/') {
        console.log('in blocked if');
        request.nextUrl.pathname = '/';
        // return NextResponse.redirect(request.nextUrl.origin + '/');
        console.log('yes indeed blocked', isBlocked.toString());
        return NextResponse.redirect(request.nextUrl);
    }

    console.log('final url', request.nextUrl);
    console.log('final url', request.nextUrl.toString());

    return NextResponse.rewrite(request.nextUrl);
}
