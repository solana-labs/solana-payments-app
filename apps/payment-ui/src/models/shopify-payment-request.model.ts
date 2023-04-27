import { object, string, InferType } from 'yup'

/*
    SPEC: https://shopify.dev/docs/apps/payments/implementation/process-a-payment/offsite#client_details-hash
*/

const customerAddressSchema = object().shape({
    given_name: string().optional(),
    family_name: string().required(),
    line1: string().required(),
    line2: string().optional(),
    city: string().required(),
    postal_code: string().required(),
    province: string().required(),
    country: string().required(),
    phone_number: string().optional(),
    company: string().required(),
})

const shopifyPaymentInitiationCustomerScheme = object().shape({
    email: string().required(),
    phone_number: string().required(),
    locale: string().required(),
    billing_address: customerAddressSchema.required(),
    shipping_address: customerAddressSchema.required(),
})

const paymentMethodDataSchema = object().shape({
    cancel_url: string().required(),
})

const paymentMethodSchema = object().shape({
    type: string().required(),
    data: paymentMethodDataSchema.required(),
})

export let shopifyPaymentInitiationScheme = object().shape({
    id: string().required(),
    gid: string().required(),
    group: string().required(),
    amount: string().required(), // must be numeric
    currency: string().required(), // three string IOS 4217 code
    test: string().required(),
    merchant_locale: string().required(),
    payment_method: paymentMethodSchema.required(),
    proposed_at: string().required(),
    kind: string().required(),
    customer: shopifyPaymentInitiationCustomerScheme.optional(),
    client_details: string().optional(),
})

export type ShopifyPaymentInitiationScheme = InferType<
    typeof shopifyPaymentInitiationScheme
>
