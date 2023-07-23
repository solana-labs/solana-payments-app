import { InferType, number, object, string } from 'yup';
import { parseAndValidateStrict } from '../../../utilities/yup.utility';

export const merchantAuthTokenSchema = object().shape({
    id: string().required(),
    iat: number().required(),
    exp: number().required(),
});

export type MerchantAuthToken = InferType<typeof merchantAuthTokenSchema>;

export const parseAndValidateMerchantAuthToken = (merchantAuthTokenBody: unknown): MerchantAuthToken => {
    return parseAndValidateStrict(
        merchantAuthTokenBody,
        merchantAuthTokenSchema,
        'Could not parse the merchant auth token body. Unknown Reason.'
    );
};
