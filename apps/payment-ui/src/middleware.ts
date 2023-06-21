import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

// Trigger this middleware to run on the `/secret-page` route
export const config = {
    matcher: '/',
};

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

    if (country === 'US' && geo.region === 'NY') {
        return true;
    }

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
    const { nextUrl: url } = request;

    const isBlocked = isBlockedGeo(request);

    const geo = request.geo;

    if (geo) {
        url.searchParams.set('country', geo.country ?? 'unknown');
    }

    url.searchParams.set('blocked', isBlocked.toString());

    return NextResponse.rewrite(url);
}
