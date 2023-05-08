<<<<<<< HEAD
import { object, string, number, InferType, boolean } from "yup";
import { parseAndValidate } from "../utilities/yup.utility.js";
=======
import { object, string, InferType } from "yup";
>>>>>>> main

export const shopifyRefundInitiationScheme = object().shape({
  id: string().required(),
  gid: string().required(),
  payment_id: string().required(),
  group: string().required(),
<<<<<<< HEAD
  amount: number().required(), // must be numeric
  currency: string().required(), // three string IOS 4217 code
  test: boolean().required(),
=======
  amount: string().required(), // must be numeric
  currency: string().required(), // three string IOS 4217 code
  test: string().required(),
>>>>>>> main
  merchant_locale: string().required(),
  proposed_at: string().required(),
});

<<<<<<< HEAD
export type ShopifyRefundInitiation = InferType<
  typeof shopifyRefundInitiationScheme
>;

export const parseAndValidateShopifyRefundInitiation = (
  shopifyRefundInitiationBody: any
): ShopifyRefundInitiation => {
  return parseAndValidate<ShopifyRefundInitiation>(
    shopifyRefundInitiationBody,
    shopifyRefundInitiationScheme,
    "Could not parse the shopify refund initiation body. Unknown Reason."
  );
};
=======
export type ShopifyRefundInitiationScheme = InferType<
  typeof shopifyRefundInitiationScheme
>;
>>>>>>> main
