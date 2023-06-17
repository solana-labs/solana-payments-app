import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { bool } from 'yup';

// The country to block from accessing the secret page
const BLOCKED_COUNTRY = 'US';

// Trigger this middleware to run on the `/secret-page` route
export const config = {
    matcher: '/',
};

const hardBlockCountries = ['CU', 'IR', 'KP', 'RU', 'SY'];
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

    if (geo) {
        url.searchParams.set('country', geo.country ?? 'unknown');
    }

    url.searchParams.set('blocked', isBlocked.toString());

    return NextResponse.rewrite(url);
}
