import { object, string, InferType, array } from 'yup';
import { parseAndValidate } from '../../utilities/yup.utility.js';
import { shopifyResponseExtensionsSchema } from './shared.model.js';

export const adminDataResponseShopSchema = object().shape({
    name: string().required(),
    email: string().required(),
    enabledPresentmentCurrencies: array().of(string()).required(),
});

export const adminDataResponseDataSchema = object().shape({
    shop: adminDataResponseShopSchema.required(),
});

export const adminDataResponseSchema = object().shape({
    data: adminDataResponseDataSchema.required(),
    extensions: shopifyResponseExtensionsSchema.required(),
});

export type AdminDataResponse = InferType<typeof adminDataResponseSchema>;

export const parseAndValidateAdminDataResponse = (adminDataResponeBody: unknown): AdminDataResponse => {
    return parseAndValidate(
        adminDataResponeBody,
        adminDataResponseSchema,
        'Could not parse the admin data response. Unknown Reason.'
    );
};
