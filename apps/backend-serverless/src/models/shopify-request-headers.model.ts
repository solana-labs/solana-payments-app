import { object, string, InferType } from 'yup';
import { parseAndValidate } from '../utilities/yup.utility.js';

export const shopifyRequestHeadersScheme = object().shape({
    'shopify-shop-domain': string().required(),
    'shopify-request-id': string().required(),
    'shopify-api-version': string().required(),
});

export type ShopifyRequestHeaders = InferType<typeof shopifyRequestHeadersScheme>;

export const parseAndValidateShopifyRequestHeaders = (shopifyRequestHeaders: any): ShopifyRequestHeaders => {
    return parseAndValidate<ShopifyRequestHeaders>(
        shopifyRequestHeaders,
        shopifyRequestHeadersScheme,
        'Could not parse the shopify request headers. Unknown Reason.'
    );
};
