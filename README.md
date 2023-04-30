# Solana Payments App

In need of documentation. Coming soon!

## How to start

1. Get ngrok running

ngrok http 9000

2. Get the database running

docker-compose up db

3. Migrate the database

cd apps/backend
npx prisma migrate dev

4. Start the backend, merchant-ui, and payment-ui

turbo run dev

_NOTE_ These steps are temporary, they will be replaced by docker-compose once I get that all set up
