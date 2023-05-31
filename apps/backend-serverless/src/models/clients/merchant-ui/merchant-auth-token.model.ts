import { object, string, InferType } from 'yup';
import { parseAndValidate } from '../../../utilities/yup.utility.js';

export const merchantAuthTokenSchema = object().shape({
    id: string().required(),
    iat: string().required(),
    exp: string().required(),
});

export type MerchantAuthToken = InferType<typeof merchantAuthTokenSchema>;

export const parseAndValidateMerchantAuthToken = (merchantAuthTokenBody: unknown): MerchantAuthToken => {
    return parseAndValidate(
        merchantAuthTokenBody,
        merchantAuthTokenSchema,
        'Could not parse the merchant auth token body. Unknown Reason.'
    );
};
