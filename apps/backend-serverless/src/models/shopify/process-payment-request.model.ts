import { InferType, bool, number, object, string } from 'yup';
import { parseAndValidateStrict } from '../../utilities/yup.utility.js';
/*
    SPEC: https://shopify.dev/docs/apps/payments/implementation/process-a-payment/offsite
*/

const customerAddressSchema = object().shape({
    given_name: string().optional(),
    family_name: string().required(),
    line1: string().required(),
    line2: string().optional(),
    city: string().required(),
    postal_code: string().optional(),
    province: string().optional(),
    country_code: string().required(),
    phone_number: string().optional(),
    company: string().optional(),
});

const shopifyPaymentInitiationCustomerScheme = object().shape({
    email: string().optional(),
    phone_number: string().optional(),
    locale: string().required(),
    billing_address: customerAddressSchema.required(),
    shipping_address: customerAddressSchema.required(),
});

const paymentMethodDataSchema = object().shape({
    cancel_url: string().required(),
});

const paymentMethodSchema = object().shape({
    type: string().required(),
    data: paymentMethodDataSchema.required(),
});

const parseParameters = params => {
    return {
        id: params.id,
        gid: params.gid,
        group: params.group,
        amount: parseFloat(params.amount), // convert amount string to number
        currency: params.currency,
        test: params.test, // convert 'true' or 'false' string to boolean
        merchant_locale: params.merchant_locale,
        payment_method: params.payment_method, // assuming paymentMethodSchema will handle this
        proposed_at: params.proposed_at,
        kind: params.kind,
        customer: params.customer, // assuming shopifyPaymentInitiationCustomerScheme will handle this
    };
};

export const shopifyPaymentInitiationScheme = object().shape({
    id: string().required(),
    gid: string().required(),
    group: string().required(),
    amount: number().required(), // must be numeric
    currency: string().required(), // three string IOS 4217 code
    test: bool().required(),
    merchant_locale: string().required(),
    payment_method: paymentMethodSchema.required(),
    proposed_at: string().required(),
    kind: string().required(),
    customer: shopifyPaymentInitiationCustomerScheme.nullable(),
});

export type ShopifyPaymentInitiation = InferType<typeof shopifyPaymentInitiationScheme>;

export const parseAndValidateShopifyPaymentInitiation = (
    paymentInitiationRequestBody: unknown
): ShopifyPaymentInitiation => {
    return parseAndValidateStrict(
        parseParameters(paymentInitiationRequestBody),
        shopifyPaymentInitiationScheme,
        'Could not parse the Shopify payment initiation request. Unknown Reason.'
    );
};
