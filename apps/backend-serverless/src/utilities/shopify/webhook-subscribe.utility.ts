import axios from 'axios';
import { shopifyAdminRestEndpoint } from '../../configs/endpoints.config.js';

interface Props {
    shop: string;
    accessToken: string;
    topic: string;
}
export async function createShopifyWebhook(props: Props) {
    const url = shopifyAdminRestEndpoint(props.shop, 'webhooks');

    const payload = {
        webhook: {
            topic: props.topic,
            address: process.env.BACKEND_URL + '/checkouts',
            format: 'json',
        },
    };

    const config = {
        headers: {
            'X-Shopify-Access-Token': props.accessToken,
        },
    };

    try {
        const response = await axios.post(url, payload, config);
        return response.data;
    } catch (error) {
        console.error(error);
    }
}
