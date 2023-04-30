import { object, string, InferType } from 'yup'

export const accessTokenResponseSchema = object().shape({
    access_token: string().required(),
    scope: string().required(),
})

export type AccessTokenResponse = InferType<typeof accessTokenResponseSchema>
