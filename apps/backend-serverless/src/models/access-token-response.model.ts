import { object, string, InferType } from 'yup'
import { parseAndValidate } from '../utilities/yup.utility.js'

export const accessTokenResponseSchema = object().shape({
    access_token: string().required(),
    scope: string().required(),
})

export type AccessTokenResponse = InferType<typeof accessTokenResponseSchema>

export const parseAndValidateAccessTokenResponse = (
    accessTokenResponseBody: unknown
): AccessTokenResponse => {
    return parseAndValidate(
        accessTokenResponseBody,
        accessTokenResponseSchema,
        'Could not parse the access token response. Unknown Reason.'
    )
}
