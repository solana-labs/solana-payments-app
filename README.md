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

### Keypairs

we recommend setting up one admin account (to manage helius api), and one gas account (to interface with all of your shopify transactions)

### Set up the Application

make sure Docker Desktop is installed and running

```
git clone https://github.com/solana-labs/solana-payments-app

yarn

(run first time to setup env variables, setup helius as below)
yarn setup:env

yarn dev

(optional: load database with dummy data)
yarn seed
```

once done, run

```
yarn kill
```

#### Helius API Key

We use Helius to listen to onchain transactions associated with merchants.

Go to [Helius](https://www.helius.dev/) and sign in with your admin keypair. Generate and copy your api key to your .env.dev (backend-serverless). (Make sure you setup your helius webook using the HELIUS_AUTHORIZATION in the .env.dev)

#### Gas Keypair

This gas keypair will be the signer for all shopify transactions so the customers don't have to pay gas fees.

It will also help track all of our relavent transactions

###### keep in mind

we generate ngrok in the background. if processes aren't killed properly, run

```
pgrep ngrok
kill -9 (ngrok pid)
```

###### Dev certs

We use dev certs since our mock-shopify-server mimics shopify's https connection. For now, we've added our own devcerts to the repo since they're only used for local development. but you can generate your own certs following [This guide](https://blog.simontimms.com/2021/10/12/serverless-offline-https/)

### Local Development

```
http://localhost:4004/install




```

### Make a Payment

Everything is running! Now let's make a payment. In production, Shopify sends a post request to the backend-serverless apps. Specifically, to our backender-serverless-green service. Go [here](/system-design/shopify/README.md#mutual-tls-mtls) to read more about why the backend-serverless app is split up into two deployed services. Locally, you have to invoke your own payment. You can do this by visiting https:localhost:4004/payment. This will mock a shopify request, create your payment, and redirect you to your locally hosted payment-ui. It should look like this

## How to Contribute

We need to flesh out more compartmentalized issues for developers to easily step in and contribute code. For now, please create an issue about further documentation you would like to see. Please make sure you set up our prettier and es-list packages and these don't conflict with your local setup. We use the [es-lint](https://github.com/solana-labs/eslint-config-solana) and [prettier](https://github.com/solana-labs/prettier-config-solana) packages from Solana Labs. Both should be installed with the rest of the dependencies.
