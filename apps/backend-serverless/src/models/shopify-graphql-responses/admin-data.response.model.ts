import { InferType, array, object, string } from 'yup';
import { parseAndValidateStrict } from '../../utilities/yup.utility';
import { shopifyResponseExtensionsSchema } from './shared.model';

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
    return parseAndValidateStrict(
        adminDataResponeBody,
        adminDataResponseSchema,
        'Could not parse the admin data response. Unknown Reason.'
    );
};
