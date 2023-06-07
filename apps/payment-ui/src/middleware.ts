import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { bool } from 'yup';

// The country to block from accessing the secret page
const BLOCKED_COUNTRY = 'US';

// Trigger this middleware to run on the `/secret-page` route
export const config = {
    matcher: '/',
};

const isBlockedGeo = (request: NextRequest): boolean => {
    const BLOCKED_COUNTRY = 'US';

    const geo = request.geo;

    if (geo == null || geo.country == null) {
        return true;
    }

    // if (geo.country === 'CN') {
    //     return true;
    // } else if (geo.country === 'US' && geo.region === 'NY') {
    //     return true;
    // }

    return false;
};

export function middleware(request: NextRequest) {
    const { nextUrl: url } = request;

    const isBlocked = isBlockedGeo(request);

    url.searchParams.set('isBlocked', isBlocked.toString());

    return NextResponse.rewrite(url);
}
