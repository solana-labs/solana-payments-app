import { parseAndValidateShopifyPaymentInitiation } from '../../../src/models/process-payment-request.model.js'

// export const shopifyPaymentInitiationScheme = object().shape({
//     id: string().required(),
//     gid: string().required(),
//     group: string().required(),
//     amount: number().required(), // must be numeric
//     currency: string().required(), // three string IOS 4217 code
//     test: boolean().required(),
//     merchant_locale: string().required(),
//     payment_method: paymentMethodSchema.required(),
//     proposed_at: string().required(),
//     kind: string().required(),
//     customer: shopifyPaymentInitiationCustomerScheme.optional(),
//   });

describe('unit testing shopify payment initiation model', () => {
    it('valid shopify payment initiation', () => {
        const validShopifyPaymentInitiation = {
            id: 'u0nwmSrNntjIWozmNslK5Tlq',
            gid: 'gid://shopify/PaymentSession/u0nwmSrNntjIWozmNslK5Tlq',
            group: 'rZNvy+1jH6Z+BcPqA5U5BSIcnUavBha3C63xBalm+xE=',
            amount: '123.00',
            currency: 'CAD',
            test: false,
            merchant_locale: 'en',
            payment_method: {
                type: 'offsite',
                data: {
                    cancel_url:
                        'https://my-test-shop.com/1/checkouts/4c94d6f5b93f726a82dadfe45cdde432',
                },
            },
            proposed_at: '2020-07-13T00:00:00Z',
            customer: {
                email: 'buyer@example.com',
                phone_number: '5555555555',
                locale: 'fr',
                billing_address: {
                    given_name: 'Alice',
                    family_name: 'Smith',
                    line1: '123 Street',
                    line2: 'Suite B',
                    city: 'Montreal',
                    postal_code: 'H2Z 0B3',
                    province: 'Quebec',
                    country_code: 'CA',
                    phone_number: '5555555555',
                    company: '',
                },
                shipping_address: {
                    given_name: 'Alice',
                    family_name: 'Smith',
                    line1: '123 Street',
                    line2: 'Suite B',
                    city: 'Montreal',
                    postal_code: 'H2Z 0B3',
                    province: 'Quebec',
                    country_code: 'CA',
                    phone_number: '5555555555',
                    company: '',
                },
            },
            kind: 'sale',
        }

        expect(() => {
            parseAndValidateShopifyPaymentInitiation(
                validShopifyPaymentInitiation
            )
        }).not.toThrow()
    })

    it('missing gid in response', () => {
        const validShopifyPaymentInitiation = {
            id: 'u0nwmSrNntjIWozmNslK5Tlq',
            group: 'rZNvy+1jH6Z+BcPqA5U5BSIcnUavBha3C63xBalm+xE=',
            amount: '123.00',
            currency: 'CAD',
            test: false,
            merchant_locale: 'en',
            payment_method: {
                type: 'offsite',
                data: {
                    cancel_url:
                        'https://my-test-shop.com/1/checkouts/4c94d6f5b93f726a82dadfe45cdde432',
                },
            },
            proposed_at: '2020-07-13T00:00:00Z',
            customer: {
                email: 'buyer@example.com',
                phone_number: '5555555555',
                locale: 'fr',
                billing_address: {
                    given_name: 'Alice',
                    family_name: 'Smith',
                    line1: '123 Street',
                    line2: 'Suite B',
                    city: 'Montreal',
                    postal_code: 'H2Z 0B3',
                    province: 'Quebec',
                    country_code: 'CA',
                    phone_number: '5555555555',
                    company: '',
                },
                shipping_address: {
                    given_name: 'Alice',
                    family_name: 'Smith',
                    line1: '123 Street',
                    line2: 'Suite B',
                    city: 'Montreal',
                    postal_code: 'H2Z 0B3',
                    province: 'Quebec',
                    country_code: 'CA',
                    phone_number: '5555555555',
                    company: '',
                },
            },
            kind: 'sale',
        }

        expect(() => {
            parseAndValidateShopifyPaymentInitiation(
                validShopifyPaymentInitiation
            )
        }).toThrow()
    })
})
