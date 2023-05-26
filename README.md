# Solana Payments App

## Learn More

Right now the overall documentation is federated to respective directories. Overall overview documentation coming soon.

[Payment App Backend](apps/backend-serverless/README.md) - Server that handles communication and orcastration of payments, merchant experience, and customer experince.<br>
[Transaction Request Server](apps/transaction-request-serverless/README.md) - Server for building transaction for payments.<br>
[Merchant UI](apps/merchant-ui/README.md) - The merchant frontend that where merchants manage their payments.<br>
[Payment UI](apps/payment-ui/README.md) - The payment frontend where customers can complete payments.<br>
[System Design](system-design/README.md) - Where we communicate overall system design decisions for the current state.<br>

## How to Deploy

1. clone the repo

```
git clone git@github.com:solana-labs/solana-payments-app.git
```

2. install the dependcies at the root

```
(from root)
yarn
```

2. install the app specific dependcies for the serverless apps

```
(from /apps/backend-sereverless/)
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

4. deploy the transaction request server

```
(from /apps/transaction-request-serverless/)
serverless deploy
```

**note** save the base url output by the `serverless deploy` command

5. create your backend server .env

```
(from /apps/backend-serverless/)
cp .sample.env .env
```

6. replace all of the sample values with your actual values. note, some are required and some are optional

required

```
SHOPIFY_SECRET_KEY=< this is the secret key from your shopify developer portal >
SHOPIFY_CLIENT_ID=< this is the client id from your shopify developer portal >
BASE_URL=< this is the base url for this server where it will be deployed >
MERCHANT_UI_URL=< this is the base url for where your merchant ui will be deployed >
PAYMENT_UI_URL=< this is the base url for where your payment ui will be deployed >
DATABASE_URL=< this is the prisma formatted url for your database. see prisma docs for format or .sample.env for example >
TRANSACTION_REQUEST_SERVER_URL=< this is the base url for where your transaction request server is deployed >
TRM_API_KEY=< this is the API key given to you by TRM >
AWS_BUCKET_OBJECT_NAME=<the name of the file containing your gas keypair>
AWS_BUCKET_NAME=<the name of the bucket containing your keypairs>
AWS_BUCKET_REGION=<the name of the region for your bucket>
AWS_ACCESS_KEY=<the access key for your user with read access to your bucket>
AWS_SECRET_KEY=<the secret key for your user with read access to your bucket>
```

optional

```
USE_AUTH_MOCK=<this is your mock merchant id if you cannot properally set up cookies on merchant-ui/backend-serverless>
TEST_USDC_SIZE=<while testing, this will be the actual cost in usdc size for your payments>
```

## How to Contribute

We need to flesh out more compartmentalized issues for developers to eaisily step in and contribute code. For now, please create issue about further documentation you would like to see. Please make sure you set up our prettier and es-list packages and these don't conflict with your local set up. We use the [es-lint](https://github.com/solana-labs/eslint-config-solana) and [prettier](https://github.com/solana-labs/prettier-config-solana) packages from Solana Labs. Both should be installed with the rest of the dependencies.
