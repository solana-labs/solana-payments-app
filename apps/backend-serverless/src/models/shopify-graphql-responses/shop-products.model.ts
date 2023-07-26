import { InferType, array, boolean, object, string } from 'yup';
import { parseAndValidateStrict } from '../../utilities/yup.utility.js';
import { shopifyResponseExtensionsSchema } from './shared.model.js';

const productNodeSchema = object({
    id: string().required(),
    title: string().required(),
    handle: string().required(),
});

const productEdgeSchema = object({
    node: productNodeSchema.required(),
    cursor: string().required(),
});

const pageInfoSchema = object({
    hasNextPage: boolean().required(),
});

const productsSchema = object({
    edges: array(productEdgeSchema).required(),
    pageInfo: pageInfoSchema.required(),
});

const dataSchema = object({
    products: productsSchema.required(),
});

const shopifyResponseSchema = object({
    data: dataSchema.required(),
    extensions: shopifyResponseExtensionsSchema.required(),
});

export type ProductNode = InferType<typeof productNodeSchema>;
export type ShopifyResponse = InferType<typeof shopifyResponseSchema>;

export const parseAndValidateShopProductsResponse = (responseBody: unknown): ShopifyResponse => {
    return parseAndValidateStrict(
        responseBody,
        shopifyResponseSchema,
        'Could not parse the Shopify product response. Unknown Reason.'
    );
};
