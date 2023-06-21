import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

const comprehensivelySanctionedCountries = ['CU', 'IR', 'KP', 'RU', 'SY'];
const ukraineRegions = ['crimea', 'donetsk', 'luhansk'];
const ofacSanctionedCountries = ['BA', 'BY', 'MM', 'CF', 'CD', 'ET', 'HK', 'IQ', 'LB', 'LY', 'SD', 'VE', 'YE', 'ZW'];
const otherCountries = ['AF', 'BY', 'MM', 'CF', 'CN', 'CI', 'CU', 'CD', 'CY', 'ER', 'HT'];
const otherCountries2 = ['IR', 'IQ', 'LB', 'LR', 'LY', 'KP', 'SO', 'SS', 'LK', 'SD', 'SY', 'VE', 'VN', 'ZW'];

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
    const region = geo.region;

    if (country == null) {
        return true;
    }

    if (comprehensivelySanctionedCountries.includes(country)) {
        return true;
    }

    // if (country === 'UA' && ukraineRegions.includes(region.toLowerCase())) {
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

    console.log('what about a normal console');
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
