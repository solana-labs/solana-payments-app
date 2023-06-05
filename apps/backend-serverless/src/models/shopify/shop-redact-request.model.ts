import { object, string, InferType } from 'yup';
import { parseAndValidate } from '../../utilities/yup.utility.js';

export const shopRedactRequestScheme = object().shape({
    shop_id: string().required(),
    shop_domain: string().required(),
});

export type ShopRedactRequest = InferType<typeof shopRedactRequestScheme>;

export const parseAndValidateShopRedactRequestBody = (shopRedactRequestBody: unknown): ShopRedactRequest => {
    return parseAndValidate<ShopRedactRequest>(
        shopRedactRequestBody,
        shopRedactRequestScheme,
        'Could not parse the shop redact body. Unknown Reason.'
    );
};
