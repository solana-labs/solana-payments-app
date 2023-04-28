import { object, string, InferType } from "yup";

export let accessTokenResponseSchema = object().shape({
  access_token: string().required(),
  scope: string().required(),
});

export interface AccessTokenResponse
  extends InferType<typeof accessTokenResponseSchema> {}
