/*

These interfaces represent the shape of the objects being given in the request
from Shopify. 

Described here: https://shopify.dev/apps/payments/processing-a-payment

*/

import { object, string, number, date, InferType, bool } from 'yup'

let paymentMethodDataSchema = object({
    cancel_url: string().url().required(),
})

let paymentMethodSchema = object({
    type: string()
        .matches(/offsite/)
        .required(),
    data: paymentMethodDataSchema.required(),
})

let addressSchema = object({
    given_name: string().optional(),
    family_name: string().required(),
    line1: string().required(),
    line2: string().optional(),
    city: string().required(),
    postal_code: string().optional(),
    province: string().optional(),
    country_code: string().required(), // ISO 3166-1 Alpha 2
    company: string().optional(),
})

let customerSchema = object({
    billing_address: addressSchema.required(),
    shipping_address: addressSchema.required(),
    email: string().email().optional(),
    phone_number: string().optional(),
    locale: string().required(), // ISO 639-1
})

export let processPaymentRequestSchema = object({
    id: string().required(),
    gid: string().required(),
    group: string().required(),
    amount: number().required(),
    currency: string().required(), // Three-letter ISO 4217
    test: bool().required(),
    merchant_locale: string().required(), // IETF BCP 47
    payment_method: paymentMethodSchema.required(),
    proposed_at: date().required(), // ISO-8601
    customer: customerSchema.optional(),
    kind: string().oneOf(['sale', 'authorization']).required(),
})

export interface ProcesPaymentRequest
    extends InferType<typeof processPaymentRequestSchema> {}
