import { object, string, InferType } from 'yup';
import { parseAndValidate } from '../utilities/yup.utility.js';

export enum ShopifyWebhookTopic {
    customerData = 'customers/data_request',
    customerRedact = 'customers/redact',
    shopReact = 'shop/redact',
}

export const shopifyWebhookHeadersScheme = object().shape({
    'X-Shopify-Topic': string().oneOf(Object.values(ShopifyWebhookTopic), 'Invalid shopify topic type').required(),
    'X-Shopify-Hmac-Sha256': string().required(),
    'X-Shopify-Shop-Domain': string().required(),
    'X-Shopify-API-Version': string().required(),
    'X-Shopify-Webhook-Id': string().required(),
    'X-Shopify-Triggered-At': string().required(),
});

export type ShopifyWebhookHeaders = InferType<typeof shopifyWebhookHeadersScheme>;

export const parseAndValidateShopifyWebhookHeaders = (shopifyRequestHeaders: any): ShopifyWebhookHeaders => {
    return parseAndValidate<ShopifyWebhookHeaders>(
        shopifyRequestHeaders,
        shopifyWebhookHeadersScheme,
        'Could not parse the shopify webhook headers. Unknown Reason.'
    );
};
