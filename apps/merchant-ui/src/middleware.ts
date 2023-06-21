import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

const hardBlockCountries = ['CU', 'IR', 'KP', 'RU', 'SY', 'US'];
const hardBlockUkraine = ['crimea', 'donetsk', 'luhansk'];

const isBlockedGeo = (request: NextRequest): boolean => {
    if (process.env.NODE_ENV === 'development') {
        return false;
    }

    const geo = request.geo;
    console.log('the geo', geo);

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
    if (
        request.nextUrl.pathname.startsWith('/public/images/') ||
        request.nextUrl.pathname.startsWith('/_next/static/') ||
        request.nextUrl.pathname.startsWith('/_next/image/') ||
        request.nextUrl.pathname.startsWith('/favicon.ico') ||
        request.nextUrl.pathname.endsWith('.png')
    ) {
        return NextResponse.next();
    }

    console.log('middleware request', request);
    const isBlocked = isBlockedGeo(request);
    const geo = request.geo;

    if (geo) {
        request.nextUrl.searchParams.set('country', geo.country ?? 'unknown');
    }

    request.nextUrl.searchParams.set('isBlocked', isBlocked.toString());

    if (isBlocked && request.nextUrl.pathname !== '/') {
        request.nextUrl.pathname = '/';
        return NextResponse.redirect(request.nextUrl);
    }

    return NextResponse.rewrite(request.nextUrl);
}
