/*

These interfaces represent the shape of the objects being given in the request
from Shopify. 

Described here: https://shopify.dev/apps/payments/processing-a-payment

*/

import { object, string, number, date, InferType, bool } from "yup";

export let processRefundRequestSchema = object({
  id: string().required(),
  gid: string().required(),
  payment_id: string().required(),
  amount: number().required(),
  currency: string().required(), // Three-letter ISO 4217
  test: bool().required(),
  merchant_locale: string().required(), // IETF BCP 47
  proposed_at: date().required(), // ISO-8601
});

export interface ProcessRefundRequest
  extends InferType<typeof processRefundRequestSchema> {}
