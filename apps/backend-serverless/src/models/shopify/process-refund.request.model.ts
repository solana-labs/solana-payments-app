import { InferType, boolean, number, object, string } from 'yup';
import { parseAndValidateStrict } from '../../utilities/yup.utility.js';

const parseParameters = params => {
    return {
        id: params.id,
        gid: params.gid,
        payment_id: params.payment_id,
        amount: parseFloat(params.amount), // convert amount string to number
        currency: params.currency,
        test: params.test, // convert 'true' or 'false' string to boolean
        merchant_locale: params.merchant_locale,
        proposed_at: params.proposed_at,
    };
};

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
    shopifyRefundInitiationBody: unknown,
): ShopifyRefundInitiation => {
    return parseAndValidateStrict<ShopifyRefundInitiation>(
        parseParameters(shopifyRefundInitiationBody),
        shopifyRefundInitiationScheme,
        'Could not parse the shopify refund initiation body. Unknown Reason.',
    );
};
