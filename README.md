# Solana Payments App

This project allows Shopify merchants to accept crypto through their shopify store, and customers to purchase products using crypto.

[Visit Documentation](https://commercedocs.solanapay.com)

[Test Payment flow](solanatest8.myshopify.com)

[Test Merchant Flow](merchant-staging.solanapay.com)

# Local Development

## Dependencies

These steps will get you up and running with a local dev environment, and you can later setup these environments for production

-   Dependencies

    -   Docker Desktop
    -   Mysql

-   Keys

    -   Gas Keypair
        -   .env.dev in backend serverless
    -   [Helius API key](https://www.helius.dev)
        -   .env.dev in backend serverless

-   Dev Certs

    -   [Follow this guide](https://blog.simontimms.com/2021/10/12/serverless-offline-https/)
    -   included sample dev certs in backend-serverless & mock-shopify-serverless, must proceed to safety on google chrome

## Commands

Installation:

```
git clone https://github.com/solana-labs/solana-payments-app
yarn install
yarn setup:env
```

Once the dependencies are all setup, env variables are set:

```
yarn dev
yarn seed
```

## Testing

Use these links to test out the local development flow

[Local Merchant UI](https://localhost:4004/install)

[Local Payment Simulation](https://localhost:4004/payment)

At the moment, here are some local development hacks we use to get it to work, these will be fixed shortly, including

-   local queue events not being sent
-   accessing mock payment records as created in the seed script

You are welcome to play around with the code as you wish.
