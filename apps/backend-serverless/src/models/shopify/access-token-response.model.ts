import { InferType, object, string } from 'yup';
import { parseAndValidateStrict } from '../../utilities/yup.utility.js';

export const accessTokenResponseSchema = object().shape({
    access_token: string().required(),
    scope: string().required(),
});

export type AccessTokenResponse = InferType<typeof accessTokenResponseSchema>;

export const parseAndValidateAccessTokenResponse = (accessTokenResponseBody: unknown): AccessTokenResponse => {
    return parseAndValidateStrict(
        accessTokenResponseBody,
        accessTokenResponseSchema,
        'Could not parse the access token response. Unknown Reason.'
    );
};
