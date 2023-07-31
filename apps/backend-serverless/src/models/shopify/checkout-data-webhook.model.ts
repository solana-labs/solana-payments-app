import { InferType, array, number, object, string } from 'yup';
import { parseAndValidateStrict } from '../../utilities/yup.utility.js';

const lineItemSchema = object().shape({
    key: string().optional().nullable(),
    product_id: number().required(),
    quantity: number().required(),
    title: string().required(),
});

const checkoutSchema = object().shape({
    id: number().optional().nullable(),
    token: string().required(),
    cart_token: string().required(),
    line_items: array().of(lineItemSchema).required(),
});

export type ShopifyCheckout = InferType<typeof checkoutSchema>;

export const parseAndValidateShopifyCheckout = (checkoutRequestBody: unknown): ShopifyCheckout => {
    return parseAndValidateStrict(
        checkoutRequestBody,
        checkoutSchema,
        'Could not parse the Shopify checkout request. Unknown Reason.'
    );
};
