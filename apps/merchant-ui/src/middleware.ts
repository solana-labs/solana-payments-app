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
    const { nextUrl: url } = request;

    const isBlocked = isBlockedGeo(request);
    const geo = request.geo;

    console.log('request', request);
    console.log('geo', request.geo);

    if (geo) {
        url.searchParams.set('country', geo.country ?? 'unknown');
    }

    console.log('after geo', url);

    // if (!geo || (geo && geo.country === BLOCKED_COUNTRY)) {
    //     request.nextUrl.pathname = '/';
    // }

    if (isBlocked && url.pathname !== '/') {
        return NextResponse.redirect('/');
        // console.log('yes indeed blocked', isBlocked.toString());
    }

    url.searchParams.set('isBlocked', isBlocked.toString());
    console.log('final url', url);

    return NextResponse.rewrite(url);
}
