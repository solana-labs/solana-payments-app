# Solana Payments App Backend

This is the serverless backend for the Solana Payments App. It plays a large roll in communicating between Shopify and the Solana Blockchain to enable Solana Pay on Shopify.

## Steps to Run

1. from solana-payments-app/ run 'yarn'
<<<<<<< HEAD
2. from solana-payments-app/apps/serverless-backed run 'npx prisma generate'
=======
2. from solana-payments-app/apps/serverless-backend run 'npx prisma generate'
>>>>>>> main
3. duplicate the .sample.env file and rename the new file to .env
4. populate the .env with your values
5. from solana-payments-app/apps/serverless-backed from 'serverless deploy'

## Where to Find Stuff

- The endpoints are all defined in serverless.yml and the handlers are in serverless-backed/src/handlers/
- The database schema can be found in serverless-backed/prisma/schema.prisma

## Patterns to Use

- For parsing responses and query parameters we use yup, you can find all of the models in serverless-backend/src/models/

## Notes

- Even though we are using turborepo, we must not hoist the dependecies for this app. They need to remain here for the Serverless Framework to package them
- you will need to run 'npx prisma migrate dev' after you make a change to the database schema or if you're connecting to a new database for the first time
<<<<<<< HEAD

## Fetures Completed & Upcoming

This is a list of supported features. Before merging into main, please test all selected items

- [ ] Paying for an order in Shopify
- [x] Canceling an open payment
- [x] Rejecting an open refund
- [ ] Refunding a completed payment
=======
>>>>>>> main
