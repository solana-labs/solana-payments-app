import { InferType, object, string } from 'yup';
import { parseAndValidateStrict } from '../../utilities/yup.utility.js';

export enum ShopifyWebhookTopic {
    customerData = 'customers/data_request',
    customerRedact = 'customers/redact',
    shopRedact = 'shop/redact',
    checkoutsCreate = 'checkouts/create',
    checkoutsUpdate = 'checkouts/update',
}

export const shopifyWebhookHeadersScheme = object().shape({
    'x-shopify-topic': string().oneOf(Object.values(ShopifyWebhookTopic), 'Invalid Shopify topic type').required(),
    'x-shopify-hmac-sha256': string().required(),
    'x-shopify-shop-domain': string().required(),
    'x-shopify-api-version': string().required(),
    'x-shopify-webhook-id': string().optional(),
    'x-shopify-triggered-at': string().optional(),
});
export type ShopifyWebhookHeaders = InferType<typeof shopifyWebhookHeadersScheme>;

export const parseAndValidateShopifyWebhookHeaders = (shopifyRequestHeaders: any): ShopifyWebhookHeaders => {
    const headersLowerCased = Object.keys(shopifyRequestHeaders).reduce((result, key) => {
        result[key.toLowerCase()] = shopifyRequestHeaders[key];
        return result;
    }, {});

    return parseAndValidateStrict<ShopifyWebhookHeaders>(
        headersLowerCased,
        shopifyWebhookHeadersScheme,
        'Could not parse the Shopify webhook headers. Unknown Reason.'
    );
};
