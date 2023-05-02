import { object, string, InferType } from "yup";

export const shopifyRefundInitiationScheme = object().shape({
  id: string().required(),
  gid: string().required(),
  payment_id: string().required(),
  group: string().required(),
  amount: string().required(), // must be numeric
  currency: string().required(), // three string IOS 4217 code
  test: string().required(),
  merchant_locale: string().required(),
  proposed_at: string().required(),
});

export type ShopifyRefundInitiationScheme = InferType<
  typeof shopifyRefundInitiationScheme
>;
