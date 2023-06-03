# Solana Payments App

## Learn More

Right now the overall documentation is federated to respective directories. Overall overview documentation coming soon.

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

2. install the dependencies at the root

```
(from root)
yarn
```

2. install the app specific dependencies for the serverless apps

```
(from /apps/backend-serverless/)
yarn
```

```
(from /apps/transaction-request-serverless/)
yarn
```

3. configure your aws credentials

```
aws configure
[enter your user aws access key id]
[enter your user aws secret access key]
```

4. run ngrok to expose your local service to helius for transaction webhooks

```
ngrok http 4000
```

5. create your .env.development files

In each app

-   backend-serverless
-   payment-ui
-   merchant-ui
-   transaction-request-serverless

You will need to copy the .sample.env.development file and replace the values that need to be changed, these are marked in the sample files.

```
cp .sample.env.development .env.development
```

Make sure you use the ngrok url from the previous step for the HELIUS_WEBHOOK_URL var.

7. generate your database database model

```
(from /apps/backend-serverless/)
npx prisma generate
```

8. migrate your database

Note: To migrate your database, it must be running. If you're using the local database we help stand up through docker-compose, do that now.

```
(from root)
docker-compose up // If you're using our assisted local database

(from /apps/backend-serverless)
npx prisma migrate dev
```

9. stand everything up

If you've done everything correctly to this point, standing up the app should be a single command

```
(from root)
yarn dev
```

## How to Contribute

We need to flesh out more compartmentalized issues for developers to easily step in and contribute code. For now, please create an issue about further documentation you would like to see. Please make sure you set up our prettier and es-list packages and these don't conflict with your local setup. We use the [es-lint](https://github.com/solana-labs/eslint-config-solana) and [prettier](https://github.com/solana-labs/prettier-config-solana) packages from Solana Labs. Both should be installed with the rest of the dependencies.
