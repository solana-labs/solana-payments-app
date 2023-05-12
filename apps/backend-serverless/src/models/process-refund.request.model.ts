import { object, string, number, InferType, boolean } from 'yup';
import { parseAndValidate } from '../utilities/yup.utility.js';

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

export const parseAndValidateShopifyRefundInitiation = (shopifyRefundInitiationBody: any): ShopifyRefundInitiation => {
    return parseAndValidate<ShopifyRefundInitiation>(
        shopifyRefundInitiationBody,
        shopifyRefundInitiationScheme,
        'Could not parse the shopify refund initiation body. Unknown Reason.'
    );
};
