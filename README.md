# Solana Payments App

## Learn More

Right now the overall documentation is federated to respective directories. 

[Payment App Backend](apps/backend-serverless/README.md) - Server that handles communication and orchestration of payments, merchant experience, and customer experience.<br>
[Transaction Request Server](apps/transaction-request-serverless/README.md) - Server for building transaction for payments.<br>
[Merchant UI](apps/merchant-ui/README.md) - The merchant frontend that where merchants manage their payments.<br>
[Payment UI](apps/payment-ui/README.md) - The payment frontend where customers can complete payments.<br>
[System Design](system-design/README.md) - Where we communicate overall system design decisions for the current state.<br>

## How to Deploy Locally

### Get Your Helius API Key

Go to [Helius](https://www.helius.dev/) and create a new account. You can use an existing account if you like, but we will modify your webhooks so it is advised you create a new account. Once you have your API key from Helius, come back here.

### Set up the Application

1. clone the repo

```
git clone git@github.com:solana-labs/solana-payments-app.git
```

2. install the dependencies

```
(from root)
yarn
```

3. run ngrok to expose your local service to helius for transaction webhooks

```
ngrok http 4000
```

4. create your .env.development files

In each app

-   backend-serverless
-   payment-ui
-   merchant-ui
-   transaction-request-serverless

You will need to copy the .sample.env.development file and replace the values that need to be changed, these are marked in the sample files.

**Note** Make sure you use the ngrok url from the previous step for the HELIUS_WEBHOOK_URL var.

5. generate your database database model

```
(from /apps/backend-serverless/)
npx prisma generate
```

6. migrate your database

Note: To migrate your database, it must be running. If you're using the local database we help stand up through docker-compose, do that now.

```
(from root)
docker-compose up // If you're using our assisted local database

(from /apps/backend-serverless)
npx prisma migrate dev

```

If you are using a local database, run

(from /apps/backend-serverless)
y prisma:seed:dev

7. stand everything up

If you've done everything correctly to this point, standing up the app should be a single command

```
(from root)
yarn dev
```

### Make a Payment

Everything is running! Now let's make a payment. In production, Shopify sends a post request to the backend-serverless apps. Specifically, to our backender-serverless-green service. Go [here](/system-design/shopify/README.md#mutual-tls-mtls) to read more about why the backend-serverless app is split up into two deployed services. Locally, you have to invoke your own payment. You can do this by visiting https:localhost:4004/payment. This will mock a shopify request, create your payment, and redirect you to your locally hosted payment-ui. It should look like this

PAYMENT UI IMAGE GOES HERE

Now you can pay by connecting your wallet OR you can scan with any mobile Solana wallet that support Solana Pay.

**Note** To pay with a mobile Solana wallet, you must have set the BACKEND_URL env var inside of payment-ui in step 4 of the Set up the Application steps.

## How to Contribute

We need to flesh out more compartmentalized issues for developers to easily step in and contribute code. For now, please create an issue about further documentation you would like to see. Please make sure you set up our prettier and es-list packages and these don't conflict with your local setup. We use the [es-lint](https://github.com/solana-labs/eslint-config-solana) and [prettier](https://github.com/solana-labs/prettier-config-solana) packages from Solana Labs. Both should be installed with the rest of the dependencies.
