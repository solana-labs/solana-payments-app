# Shopify Technical Requirements

Shopify has a list of technical requirements that payment apps are required to support [here].(https://shopify.dev/docs/apps/payments#technical-requirements) This is how we implent and suppport each of those.

## [Idempotency](https://shopify.dev/docs/apps/payments/implementation#idempotency)

As a payments app we need to support idempotency in both directions. Meaning if Shopify sends us duplicate payment requests, we should not have this result in a customer paying twice.

### Shopify -> US

When Shopify sends us requests for either [payments](https://shopify.dev/docs/apps/payments/implementation/process-a-payment/offsite#initiate-the-flow) or [refunds](https://shopify.dev/docs/apps/payments/implementation/process-a-refund#initiate-the-flow) we will receive a post request. You can find the respective handlers they will call here:

-   [payments](../../apps/backend-serverless/src/handlers/shopify-handlers/payment.ts)
-   [refunds](../../apps/backend-serverless/src/handlers/shopify-handlers/refund.ts)

Both of these requests inlcude an 'id' in the request body that serves as the idempotency key. To handle this technical requirement we do a few things within the:

-   handlers
-   database
-   transaction building logic

**Handlers** - We will only create a single PaymentRecord and RefundRecord for each 'id' value we receive. When we receive a request, we will first check if we have an existing PaymentRecord or RefundRecord for that 'id'. If we do, we will then opporate as if we had just created it. Responding with success and returning what ever values we are required to for that record.

**Database** - When creating a PaymentRecord or RefundRecord in the database, we assign the given 'id' value from shopify as the 'shopId' on the entry. To prevent duplicate records, we have marked 'shopId' as unique. This should then result in throwing an error if we try to create another PaymentRecord with the same 'shopId' as another record in the database.

**Transaction Building Logic** - An imporant part of the system design for our payment app is having an open endpoint to generate transactions. This enables us to support [Solana Pay Transaction Requests](https://github.com/solana-labs/solana-pay/blob/master/SPEC.md#specification-transaction-request). To prevent double spending, it is not enough to check against the database for the state of a given record. This has to led to us using a conecpt we are calling [Single Use Accounts](../README.md). In each transaction we build for a given record, we generate a deterministic keypair that is generated using the 'shopId' as input. This keypair is then used in a System Program Create Account instruction which is added to each transaction. Then, even if we end up in situation where multiple transactions are fetched for a single record, only one of those transactions will be able to land on chain.

### Us -> Shopify

Shopify handles the idepotency on their end when we make requests to them about payments and refunds. We make these calls to Shopify when we "discover" transactions that corespond to PaymentRecords and RefundRecords we maintain. For redundency, we have multiple ways to "discover" these transactions including:

-   [webhooks](../../apps/backend-serverless/src/handlers/webhooks/helius.ts)
-   [polling](../../apps/backend-serverless/src/handlers/webhooks/helius.ts)

If we end up in a situation where we discover the same transaction twice and then make the same request to shopify twice, Shopify guarentees they will only perform the mutation once and they will response the same both times. This would result in us re-updating the database record with the same update which has no negative effects.

Another thing Shopify guards against is making conflict requests for a given payment and refund. For example, a payment can not be rejected and resolved. If this were to happen, Shopify would notify us within the userErrors field of the response. We will then log this message and treat it according. In our current system design, this should not be possible. The only reason that we will send a rejectPaymentSession request to Shopify is if a customer's wallet address is determined to be "risky" by our Wallet Monitoring partner, TRM. We make this check when a transaction is being fetched from the [pay-transaction handler](../../apps/backend-serverless/src/handlers/transactions/payment-transaction.ts). In this case, we will never return a transaction. If this does happen, we log the reason within Sentry and address the bug.

For refunds, it is more likely for this situation to occur. This is because Merchants have the ability to pay a refund or reject a refund within the merchant portal. Let's break this situation down

-   merchant tries to pay an already rejected transaction

if a merchant is trying to pay an already rejected transaction, this means they are calling the /refund-transaction handler. in this handler, we should be able to query the database for the status of the refund record. if that status has been marked as rejected, we should fail here and neglect to return a transaction to the merchant.

-   merchant tries to reject an already paid transaction

if a merchant tries to reject a transaction, they are calling the /reject-refund handler. here, we can query the database for the record and check the status. if the status is marked as paid or completed, we should fail the request and respond according. shopify should never be sent a reject message. if they did, they would tell us it didnt work. this then means that the only times we could end up in a bad situation here is if there is some race condition and a merchat tries to quickly pay and quickly reject a refund. maybe from seperate computers or fast in the ui. we should figure out something here and document the solution. TODO. Also note this is very unlikly and would require a merchant trying to break something or an odd situation. We can likely log previous things like lastAttempt time and require that merchants can only attmept to pay or reject a refund within some given window.
