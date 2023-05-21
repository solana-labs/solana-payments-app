# Shopify Technical Requirements

Shopify has a list of technical requirements that payment apps are to support [here](https://shopify.dev/docs/apps/payments#technical-requirements). This is how we implent and suppport each of those.

## [Idempotency](https://shopify.dev/docs/apps/payments/implementation#idempotency)

As a payments app we need to support idempotency in both directions. Meaning even if Shopify sends us duplicate requests, this cannot result in customers paying twice or merchants refunding twice.

### Shopify to Us

Shopify sends us requests to initiate [payments](https://shopify.dev/docs/apps/payments/implementation/process-a-payment/offsite#initiate-the-flow) and [refunds](https://shopify.dev/docs/apps/payments/implementation/process-a-refund#initiate-the-flow) through our respective [/payment](../../apps/backend-serverless/src/handlers/shopify-handlers/payment.ts) and [/refund](../../apps/backend-serverless/src/handlers/shopify-handlers/refund.ts) endpoints.

Both of these requests inlcude an `id` in the request body that serves as the idempotency key. To handle this technical requirement we do a few things within the handlers, database, and transaction building logic.

**Handlers** - We will only create a single PaymentRecord and RefundRecord for each `id` value we receive. When we receive a request, we will first check if we have an existing PaymentRecord or RefundRecord for that `id`. If we do, we will then opporate as if we had just created it. Responding with success and returning what ever values we are required to for that initiation.

**Database** - When creating a PaymentRecord or RefundRecord in the database, we assign the given `id` value from shopify as the `shopId` on the entry. To prevent duplicate records, we have marked `shopId` as unique. This should then result in throwing an error if we try to create another PaymentRecord with the same `shopId` as another record in the database.

**Transaction Building Logic** - An imporant part of the system design for our payment app is having an open endpoint to generate transactions. This enables us to support [Solana Pay Transaction Requests](https://github.com/solana-labs/solana-pay/blob/master/SPEC.md#specification-transaction-request). To prevent double spending, it is not enough to check against the database for the state of a given record. This has to led to us using a conecpt we are calling [Single Use Accounts](../README.md#single-use-accounts). In each transaction we build for a given record, we generate a deterministic keypair that is generated using the `shopId` as input. This keypair is then used in a System Program Create Account instruction which is added to each transaction. Then, even if we end up in situation where multiple transactions are fetched for a single record, only one of those transactions will be able to land on chain.

### Us to Shopify

Shopify handles the idepotency on their end when we make requests to them about payments and refunds. We make these calls to Shopify when we "discover" transactions that corespond to PaymentRecords and RefundRecords we maintain. For redundency, we have multiple ways to "discover" these transactions including:

-   [webhooks](../../apps/backend-serverless/src/handlers/webhooks/helius.ts)
-   [polling](../../apps/backend-serverless/src/handlers/webhooks/helius.ts)

If we end up in a situation where we discover the same transaction twice and then make the same request to shopify twice, Shopify guarentees they will only perform the mutation once and they will response the same both times. This would result in us re-updating the database record with the same update which has no negative effects.

Another thing Shopify guards against is making conflict requests for a given payment and refund. For example, a payment can not be rejected and resolved. If this were to happen, Shopify would notify us within the userErrors field of the response. We will then log this message and treat it according. In our current system design, this should not be possible. The only reason that we will send a rejectPaymentSession request to Shopify is if a customer's wallet address is determined to be "risky" by our Wallet Monitoring partner, TRM. We make this check when a transaction is being fetched from the [pay-transaction handler](../../apps/backend-serverless/src/handlers/transactions/payment-transaction.ts). In this case, we will never return a transaction. If this does happen, we log the reason within Sentry and address the bug.

For refunds, it is more likely for this situation to occur. This is because Merchants have the ability to pay a refund or reject a refund within the merchant portal. The fix here is likely to add some sort of time delay on conflict actions like making a merchant wait 5 minutes to reject a refund they have tried to pay and making a merchant wait 5 minutes to pay a refund they have tried to reject. We can also seperate a merchant send us a message that they want to pay a merchant and then have a forced time delay for actually serving the request. TBD.
