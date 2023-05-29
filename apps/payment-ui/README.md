# Payment UI

This is the payment ui component to the payment app. The goal of this app is to give customer a great experience using Solana Pay. This version is strongly coupled to the rest of the app but later can be improved to be more general.

## Steps to run

We use yarn for package management in the app. Running

```
yarn
```

from the root directory of the app should install of the required packages for payment-ui.

Then from `/apps/payment-ui' run

```
yarn dev
```

This should run the app locally on port 3001.

When you visit the app, right now you will see this error

```
Error: Hydration failed because the initial UI does not match what was rendered on the server.
```

This error is expected and can be ignored for now.
