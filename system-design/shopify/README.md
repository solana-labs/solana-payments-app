# Shopify Technical Requirements

Shopify has a list of technical requirements that payment apps are to support [here](https://shopify.dev/docs/apps/payments#technical-requirements). This is how we implent and suppport each of those.

## [Idempotency](https://shopify.dev/docs/apps/payments/implementation#idempotency)

As a payments app we need to support idempotency in both directions. Meaning even if Shopify sends us duplicate requests, this cannot result in customers paying twice or merchants refunding twice. On the other side, Shopify guarentees us that duplicate requests made will have no ill side effects.

### Shopify to Us

Shopify sends us requests to initiate [payments](https://shopify.dev/docs/apps/payments/implementation/process-a-payment/offsite#initiate-the-flow) and [refunds](https://shopify.dev/docs/apps/payments/implementation/process-a-refund#initiate-the-flow) through our respective [/payment](../../apps/backend-serverless/src/handlers/shopify-handlers/payment.ts) and [/refund](../../apps/backend-serverless/src/handlers/shopify-handlers/refund.ts) endpoints.

Both of these requests inlcude an `id` in the request body that serves as the idempotency key. To handle this technical requirement we do a few things within the handlers, database, and transaction building logic.

**Handlers** - We will only create a single PaymentRecord and RefundRecord for each `id` value we receive. When we receive a request, we will first check if we have an existing PaymentRecord or RefundRecord for that `id`. If we do, we will then opporate as if we had just created it. Responding with success and returning what ever values we are required to for that initiation.

**Database** - When creating a PaymentRecord or RefundRecord in the database, we assign the given `id` value from shopify as the `shopId` on the entry. To prevent duplicate records, we have marked `shopId` as unique. This should then result in throwing an error if we try to create another PaymentRecord with the same `shopId` as another record in the database.

**Transaction Building Logic** - An imporant part of the system design for our payment app is having an open endpoint to generate on chain transactions. This enables us to support [Solana Pay Transaction Requests](https://github.com/solana-labs/solana-pay/blob/master/SPEC.md#specification-transaction-request). To prevent double spending, it is not enough to check against the database for the state of a given record. This has to led to us using a conecpt we are calling [Single Use Accounts](../README.md#single-use-accounts). In each transaction we build for a given record, we generate a deterministic keypair that is generated using the `shopId` as input. This keypair is then used in a System Program Create Account instruction which is added to each transaction. Then, even if we end up in situation where multiple transactions are fetched for a single record, only one of those transactions will be able to land on chain.

### Us to Shopify

Shopify handles the idepotency on their end when we make requests to them about payments and refunds. We make these calls to Shopify when we "discover" transactions that corespond to PaymentRecords and RefundRecords we maintain. For redundency, we have multiple ways to "discover" these transactions including:

-   [webhooks](../../apps/backend-serverless/src/handlers/webhooks/helius.ts)
-   [polling](../../apps/backend-serverless/src/handlers/webhooks/helius.ts)

If we end up in a situation where we discover the same transaction twice and then make the same request to shopify twice, Shopify guarentees they will only perform the mutation once and they will response the same both times. This would result in us re-updating the database record with the same update which has no negative effects.

Another thing Shopify guards against is making conflict requests for a given payment and refund. For example, a payment can not be rejected and resolved. If this were to happen, Shopify would notify us within the userErrors field of the response. We will then log this message and treat it according. In our current system design, this should not be possible. The only reason that we will send a rejectPaymentSession request to Shopify is if a customer's wallet address is determined to be "risky" by our Wallet Monitoring partner, TRM. We make this check when a transaction is being fetched from the [pay-transaction handler](../../apps/backend-serverless/src/handlers/transactions/payment-transaction.ts). In this case, we will never return a transaction. If this does happen, we log the reason within Sentry and address the bug.

For refunds, it is more likely for this situation to occur. This is because Merchants have the ability to pay a refund or reject a refund within the merchant portal. The fix here is likely to add some sort of time delay on conflict actions like making a merchant wait 5 minutes to reject a refund they have tried to pay and making a merchant wait 5 minutes to pay a refund they have tried to reject. We can also seperate a merchant send us a message that they want to pay a merchant and then have a forced time delay for actually serving the request. TBD.

## [Retry Policy](https://shopify.dev/docs/apps/payments/implementation#retry-policy)

We are required to implement a retry policy on all payment app mutations in case Shopify is not able to handle our requests at any time. This includes:

-   resolve payment
-   reject payment
-   resolve refund
-   reject refund
-   app configure

We handle this with a message queue using [Amazon SQS](https://aws.amazon.com/sqs/) and [AWS Step Functions](https://aws.amazon.com/step-functions/). On failed requests to Shopify inside [process discovered payment transaction](/apps/backend-serverless/src/services/buisness-logic/process-discovered-payment-transaction.service.ts) and [process discovered refund transaction](/apps/backend-serverless/src/services/buisness-logic/process-discovered-refund-transaction.service.ts) we add a message to the queue. We have set up our [sqs message receive handler](/apps/backend-serverless/src/handlers/webhooks/sqs-message-receive.ts) to get invoked when new messages are added to the queue inside of our [serverless.yml](/apps/backend-serverless/serverless.yml) file. When that handler is invoked it then reads the message, and uses that as input to invoke our step function which is also defined inside of the [serverless.yml](/apps/backend-serverless/serverless.yml) file. It will wait for the inputted number of seconds before invoking the [retry handler](/apps/backend-serverless/src/handlers/webhooks/retry.ts). In the retry handler, we will retry the original call to Shopify. If it fails, we will once again add a message to our message queue to be picked up by the [sqs message receive handler](/apps/backend-serverless/src/handlers/webhooks/sqs-message-receive.ts).

## [Mutual TLS (mTLS)](https://shopify.dev/docs/apps/payments/implementation#mtls-configuration)

As a part of Shopify's security model, we need to implement mTLS for all requests where Shopify acts as the client and we act as the server. For us that is five cases:

1. payment initiation
2. refund initiation
3. customer data gdpr webhook
4. customer redact gdpr webhook
5. shop redact gdpr webhook

We are still working on our mTLS strategy but we will update a description here when it is finished.

## [HMAC verification](https://shopify.dev/docs/apps/auth/oauth/getting-started#verify-a-request)

HMAC verifiication is one of the security methods shopify uses alongside [mTLS]() and [access tokens](). It is used during the auth flow with Shopify that happens while installing that app to a merchan't Shopify store. We implent this for both the [install]() and [redirect] handlers. It happens in the [install verify]() and [redirect verify]() methods respectivly. There is also a testing suite for the [install verify]() and [redirect verify]() methods.

## [Rate limiting](https://shopify.dev/docs/apps/payments/implementation#rate-limiting)

We currently get the rate limiting values back from Shopify when we make the graphql mutations. We will start storing these values as well before we submit for review but I don't see this becoming an issue so will likely push back rate limiting functionality on our end.

## [API versioning](https://shopify.dev/docs/api/usage/versioning)

We currently support API version 2023-01. We will soon add checks at the begining of our handlers and in the requests to Shopify. After release of the first version, we will start adding support for 2023-04.

## [GDPR](https://shopify.dev/docs/apps/webhooks/configuration/mandatory-webhooks)

There are three mantatory APIs that Shopify requires we support.

1. customer data request
2. customer data redact
3. shop redact

Currently, we don't store any info about customers in our app ( bullish on privacy ) so the first two APIs aren't very important to us. For these, we still

-   host them
-   protect them with mTLS
-   verify they are accessed with correct payloads

For the shop redact, we are still figuring out how this effects our existing records and future refunds. Once those details are discovered, we will likley either immediatly remove items from the database or store the request to proccess these manually.
