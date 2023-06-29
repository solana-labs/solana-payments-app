import { InferType, boolean, number, object, string } from 'yup';
import { parseAndValidateStrict } from '../../utilities/yup.utility.js';

export const shopifyRefundInitiationScheme = object().shape({
    id: string().required(),
    gid: string().required(),
    payment_id: string().required(),
    amount: number().required(), // must be numeric
    currency: string().required(), // three string IOS 4217 code
    test: boolean().required(),
    merchant_locale: string().required(),
    proposed_at: string().required(),
});

export type ShopifyRefundInitiation = InferType<typeof shopifyRefundInitiationScheme>;

export const parseAndValidateShopifyRefundInitiation = (
    shopifyRefundInitiationBody: unknown
): ShopifyRefundInitiation => {
    return parseAndValidateStrict<ShopifyRefundInitiation>(
        shopifyRefundInitiationBody,
        shopifyRefundInitiationScheme,
        'Could not parse the shopify refund initiation body. Unknown Reason.'
    );
};
