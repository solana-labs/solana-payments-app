import { object, string, InferType } from "yup";

export let appInstallQueryParmSchema = object().shape({
  hmac: string().optional(), // optional for the purpose of validation. i should do an extra check here or make a new structure
  shop: string()
    .matches(/^https?\:\/\/[a-zA-Z0-9][a-zA-Z0-9\-]*\.myshopify\.com\/?/)
    .required(),
  timestamp: string().required(),
});

export type AppInstallQueryParam = InferType<typeof appInstallQueryParmSchema>;
