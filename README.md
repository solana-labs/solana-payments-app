# Solana Payments App

In need of documentation. Coming soon!

## Set up your env vars ( .env at root )

MYSQL_ROOT_PASSWORD=
MYSQL_DATABASE=
MYSQL_USER=
MYSQL_PASSWORD=

SHOPIFY_CLIENT_ID=
SHOPIFY_SECRET_KEY=

AUTH_0_CLIENT_ID=
AUTH_0_CLIENT_SECRET=
AUTH_0_DOMAIN=

DATABASE_PORT=
BACKEND_PORT=
MERCHANT_UI_PORT=
PAYMENT_UI_PORT=

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
