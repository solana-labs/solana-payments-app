# Solana Payments App

## Learn More

Right now the overall documentation is federated to respective directories. Overall overview documentation coming soon.

[Payment App Backend](apps/backend-serverless/README.md) - Server that handles communication and orchestration of payments, merchant experience, and customer experience.<br>
[Transaction Request Server](apps/transaction-request-serverless/README.md) - Server for building transaction for payments.<br>
[Merchant UI](apps/merchant-ui/README.md) - The merchant frontend that where merchants manage their payments.<br>
[Payment UI](apps/payment-ui/README.md) - The payment frontend where customers can complete payments.<br>
[System Design](system-design/README.md) - Where we communicate overall system design decisions for the current state.<br>

## How to Deploy Locally

These steps will get you up and running with a local dev environment, and you can later setup these environments for production

### Set up the Application

```
git clone https://github.com/solana-labs/solana-payments-app

yarn

(run first time to setup env variables, setup helius as below)
yarn setup:env

yarn dev

(optional: load database with dummy data)
yarn seed
```

#### Helius API Key

We use Helius to listen to onchain transactions associated with merchants.

Go to [Helius](https://www.helius.dev/) and create a new account. You can use an existing account if you like, but we will modify your webhooks so it is advised you create a new account. Once you have your API key from Helius, edit the env variable in backend_serverless/.env.dev. (Make sure you setup your helius webook using the HELIUS_AUTHORIZATION in the .env.dev)

#### Gas Keypair

### Local Development

```
http://localhost:4004/install




```

### Make a Payment

Everything is running! Now let's make a payment. In production, Shopify sends a post request to the backend-serverless apps. Specifically, to our backender-serverless-green service. Go [here](/system-design/shopify/README.md#mutual-tls-mtls) to read more about why the backend-serverless app is split up into two deployed services. Locally, you have to invoke your own payment. You can do this by visiting https:localhost:4004/payment. This will mock a shopify request, create your payment, and redirect you to your locally hosted payment-ui. It should look like this

## How to Contribute

We need to flesh out more compartmentalized issues for developers to easily step in and contribute code. For now, please create an issue about further documentation you would like to see. Please make sure you set up our prettier and es-list packages and these don't conflict with your local setup. We use the [es-lint](https://github.com/solana-labs/eslint-config-solana) and [prettier](https://github.com/solana-labs/prettier-config-solana) packages from Solana Labs. Both should be installed with the rest of the dependencies.
