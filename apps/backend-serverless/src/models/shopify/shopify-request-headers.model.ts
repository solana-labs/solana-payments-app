import { InferType, object, string } from 'yup';
import { parseAndValidateStrict } from '../../utilities/yup.utility';

export const shopifyRequestHeadersScheme = object().shape({
    'shopify-shop-domain': string().required(),
    'shopify-request-id': string().required(),
    'shopify-api-version': string().required(),
});

export type ShopifyRequestHeaders = InferType<typeof shopifyRequestHeadersScheme>;

export const parseAndValidateShopifyRequestHeaders = (shopifyRequestHeaders: unknown): ShopifyRequestHeaders => {
    return parseAndValidateStrict<ShopifyRequestHeaders>(
        shopifyRequestHeaders,
        shopifyRequestHeadersScheme,
        'Could not parse the shopify request headers. Unknown Reason.'
    );
};
