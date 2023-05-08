import { object, string, InferType, array } from "yup";

export const shopifyResponseExtensionsThrottleStatusSchema = object().shape({
  maximumAvailable: string().optional(),
  currentlyAvailable: string().optional(),
  restoreRate: string().optional(),
});

export const shopifyResponseExtensionsCostSchema = object().shape({
  requestedQueryCost: string().optional(),
  actualQueryCost: string().optional(),
  throttleStatus: shopifyResponseExtensionsThrottleStatusSchema.optional(),
});

export const shopifyResponseExtensionsSchema = object().shape({
  cost: shopifyResponseExtensionsCostSchema.optional(),
});

export const sharedRefundResponseStateSchema = object().shape({
  code: string().optional(),
  reason: string().optional(),
  merchantMessage: string().optional(),
});

export const sharedRefundResponseRefundSessionSchema = object().shape({
  id: string().required(),
  state: sharedRefundResponseStateSchema.optional(),
});

export const sharedRefundResponseRootSchema = object().shape({
  refundSession: sharedRefundResponseRefundSessionSchema.required(),
  userErrors: array().of(string()).required(),
});

export const sharedPaymentResponseStateSchema = object().shape({
  code: string().required(),
});

export const sharedPaymentResponseContextSchema = object().shape({
  redirectUrl: string().required(),
});

export const resolvePaymentResponseNextActionSchema = object().shape({
  action: string().required(),
  context: sharedPaymentResponseContextSchema.optional(),
});

export const sharedPaymentResponsePaymentSessionSchema = object().shape({
  id: string().required(),
  state: sharedPaymentResponseStateSchema.optional(),
  nextAction: resolvePaymentResponseNextActionSchema.optional(),
});

export const sharedPaymentResponseRootSchema = object().shape({
  paymentSession: sharedPaymentResponsePaymentSessionSchema.required(),
  userErrors: array().of(string()).required(),
});
