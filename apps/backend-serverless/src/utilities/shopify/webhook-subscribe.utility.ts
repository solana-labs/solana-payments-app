import axios from 'axios';
import { shopifyAdminRestEndpoint } from '../../configs/endpoints.config.js';

interface Props {
    shop: string;
    accessToken: string;
    topic: string;
    endpoint: string;
}
export async function createShopifyWebhook(props: Props) {
    const url = shopifyAdminRestEndpoint(props.shop, 'webhooks');

    const payload = {
        webhook: {
            topic: props.topic,
            address: process.env.BACKEND_URL + props.endpoint,
            format: 'json',
        },
    };

    const headers = {
        'X-Shopify-Access-Token': props.accessToken,
    };

    try {
        let response;
        if (process.env.NODE_ENV === 'development') {
            return;
            // const agent = new https.Agent({
            //     rejectUnauthorized: false,
            // });

            // response = await axios({
            //     url,
            //     method: 'POST',
            //     data: payload,
            //     headers,
            //     httpsAgent: agent,
            // });
        } else {
            response = await axios({
                url,
                method: 'POST',
                data: payload,
                headers: headers,
            });
        }

        return response.data;
    } catch (error) {
        console.error(error);
    }
}
