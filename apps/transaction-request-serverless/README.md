# Transaction Request Server

A transaction request server is an idea coined by [Link] Solana Pay. It is used as a component in the Solana Pay Prtocol to deliver arbrirary transactions through the scanning of QR codes instead of simple token transactionss

This is the transaction request server for the [Link] Solana Payments App. We decided to build a transaction request server for a few reasons:

1. Future proof
2. Seperation of logic
3. Reusablility, for example this transaction request server could also be used for something like dialect smart messages.

## Steps to Run

1. from solana-payments-app/ run 'yarn'
2. from solana-payments-app/apps/transaction-request-serverless from 'serverless deploy'
