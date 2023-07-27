import { Merchant } from '@prisma/client';
import axios from 'axios';
import https from 'https';
import { shopifyAdminRestEndpoint } from '../../configs/endpoints.config.js';

export const fetchCheckoutData = async (merchant: Merchant, checkoutId: string): Promise<any> => {
    if (!merchant.accessToken) {
        return {};
    }

    const headers = {
        'X-Shopify-Access-Token': merchant.accessToken,
    };

    let response;
    if (process.env.NODE_ENV === 'development') {
        const agent = new https.Agent({
            rejectUnauthorized: false,
        });

        response = await axios({
            url: shopifyAdminRestEndpoint(merchant.shop, checkoutId),
            method: 'GET',
            headers: headers,
            httpsAgent: agent,
        });
    } else {
        response = await axios({
            url: shopifyAdminRestEndpoint(merchant.shop, checkoutId),
            method: 'GET',
            headers: headers,
        });
    }

    console.log('response.data', response.data);
    return response.data;
};
