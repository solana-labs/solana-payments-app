import { object, string, InferType, array } from "yup";
import { parseAndValidate } from "../../utilities/yup.utility.js";
import {
  sharedPaymentResponseRootSchema,
  shopifyResponseExtensionsSchema,
} from "./shared.model.js";

export const resolvePaymentResponseDataSchema = object().shape({
  paymentSessionResolve: sharedPaymentResponseRootSchema.required(),
});

export const resolvePaymentResponseSchema = object().shape({
  data: resolvePaymentResponseDataSchema.required(),
  extensions: shopifyResponseExtensionsSchema.required(),
});

export type ResolvePaymentResponse = InferType<
  typeof resolvePaymentResponseSchema
>;

export const parseAndValidateResolvePaymentResponse = (
  resolvePaymentResponeBody: any
): ResolvePaymentResponse => {
  return parseAndValidate(
    resolvePaymentResponeBody,
    resolvePaymentResponseSchema,
    "Could not parse the resolve payment response. Unknown Reason."
  );
};
