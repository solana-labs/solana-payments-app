import { object, string, InferType } from 'yup';
import { parseAndValidate, parseAndValidateStrict } from '../utilities/yup.utility.js';
import { camelCase } from 'lodash';

function toCamelCase(obj: Record<string, string>): Record<string, string> {
    return Object.keys(obj).reduce((result, key) => {
        // Here we are removing 'X-Shopify-' from the key and converting the rest to camelCase
        let newKey = camelCase(key.replace('X-Shopify-', ''));
        // Replacing the first character with the same character but in lowercase
        newKey = newKey.charAt(0).toLowerCase() + newKey.slice(1);
        return { ...result, [newKey]: obj[key] };
    }, {});
}

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

// export type ParsedShopifyWebhookHeaders = {
//     topic: string;
//     hmacSha256: string;
//     shopDomain: string;
//     apiVersion: string;
//     webhookId: string;
//     triggeredAt: string;
// };

export const parseAndValidateShopifyWebhookHeaders = (shopifyRequestHeaders: any): ShopifyWebhookHeaders => {
    return parseAndValidate<ShopifyWebhookHeaders>(
        shopifyRequestHeaders,
        shopifyWebhookHeadersScheme,
        'Could not parse the shopify webhook headers. Unknown Reason.'
    );
};
