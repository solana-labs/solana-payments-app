# Payments App System Design

This doc should serve as the starting point of the system design for the Solana Payment App.

Note: Given we are in the very early stages of development, this should change over time with the build out.

## Components

-   Backend - Orcastration logic that connects merchants to consumers who want to complete a payment over the Solana network
-   Mertchant UI - General merchant managment portal
-   Payment UI - UI for completing a payment on Solana, lightly coupled to the Solana Payments Appp
-   Transaction Request Server - Generalized transaction building engine for payments

## System Design Goals

-   Serve multiple platforms with reusable infrastructure
-   Leverage Solana where possible to remove dependecies on hosted services
-   Easy to deploy and host your own instance of the payments app

## Main Flows

-   Payment Flow
-   Refund Flow
-   Auth Flow

### Payment Flow

The Payment Flow is broken up into three phases.

Phase One: Shopify notifies the payment's app backend of a payment that needs to be made. We will respond with a url that the customer can checkout from.

Phase Two: The customer requests a payment transaction from the backend.

Phase Three: We discover a completed transaction, notify Shopify it's been completed, and send the customer back to Shopify.

```mermaid
sequenceDiagram
    title Payment Flow: Phase One
    autonumber
    participant Helius
    participant Solana as Solana Blockchain
    participant Wallet as Alice's Wallet
    participant Alice as Alice's Browser
    participant SHOP as Shopify Backend
    participant BACKEND as Payment App Backend
    participant DATABASE as Payment App Database
    participant S3
    participant TRM as TRM Labs
    participant TRS as Transaction Request Server
    Alice-xSHOP: selects Solana Pay as her payment method
    SHOP->>BACKEND: /payment
    BACKEND->DATABASE: CREATE PaymentRecord
    BACKEND->>SHOP: 200 { redirect_url: string }
    SHOP->>Alice: 301 { redirect_url: string }
```

```mermaid
sequenceDiagram
    title Payment Flow: Phase Two
    autonumber
    participant Helius
    participant Solana as Solana Blockchain
    participant Wallet as Alice's Wallet
    participant Alice as Alice's Browser
    participant SHOP as Shopify Backend
    participant BACKEND as Payment App Backend
    participant DATABASE as Payment App Database
    participant S3
    participant TRM as TRM Labs
    participant TRS as Transaction Request Server
    Alice->>BACKEND: /pay-transaction
    BACKEND->DATABASE: SELECT PaymentRecord
    BACKEND->>TRS: /transaction
    TRS-->>BACKEND: 200 { tx: string, message: string }
    BACKEND->>TRM: /riskApi
    TRM-->>BACKEND: 200 { riskLevel: int }
    BACKEND->S3: fetch gas keypair
    BACKEND->BACKEND: sign transaction
    BACKEND->>DATABASE: UPDATE PaymentRecord
    BACKEND->>Alice: 200 { tx: string, message: string }
```

```mermaid
sequenceDiagram
    title Payment Flow: Phase Three
    autonumber
    participant Helius
    participant Solana as Solana Blockchain
    participant Wallet as Alice's Wallet
    participant Alice as Alice's Browser
    participant SHOP as Shopify Backend
    participant BACKEND as Payment App Backend
    participant DATABASE as Payment App Database
    participant S3
    participant TRM as TRM Labs
    participant TRS as Transaction Request Server
    Helius->>BACKEND: /helius
    BACKEND->DATABASE: SELECT PaymentRecord
    BACKEND->DATABASE: UPDATE PaymentRecord
    BACKEND->DATABASE: SELECT Merchant
    BACKEND->>Shop: mut paymentSessionResolve
    Shop-->>BACKEND: 200 { redirect_url: string }
    BACKEND->>DATABASE: UPDATE PaymentRecord
    Alice->>BACKEND: /paymentStatus
    BACKEND-->>Alice: 200 { status: string, redirect_url: string }
    Alice-->>Alice: redirect back to Shopify
```

### Refund Flow

```mermaid
sequenceDiagram
    autonumber
    participant Helius
    participant Solana as Solana Blockchain
    participant Wallet as Merchant's Wallet
    participant Portal as Merchant's UI
    actor Merchant
    participant Shop as Shopify Backend
    participant Backend as Payment App Backend
    participant Database as Payment App Database
    participant S3
    participant TRS as Transaction Request Server
    Merchant-xShop: initiate a refund
    Shop->>Backend: /refund
    Backend->Database: SELECT PaymentRecord
    Backend->Database: CREATE RefundRecord
    Backend->Database: UPDATE PaymentRecord
    Backend->>Shop: 200 Ok
    Merchant-xPortal: visits the merhcant portal
    Portal->>Backend: /refunds
    Backend->>Database: SELECT RefundRecord
    Backend-->>Portal: 200 { refunds: [ ... ] }
    Merchant-xPortal: select refund to process
    Portal->>Backend: /transaction
    Backend->Database: SELECT RefundRecord
    Backend->TRS: /transaction
    TRS-->>Backend: 200 { tx: string, message: string }
    Backend->S3: fetch gas keypair
    Backend->>Backend: sign transaction
    Backend->Database: UPDATE RefundRecord
    Backend-->>Portal: 200 { tx: string, message: string }
    Portal->>Wallet: signTransaction
    Wallet-->>Portal: signed transaction
    Portal->>Solana: sendRawTransaction
    Helius->>Backend: /helius
    Backend->Database: SELECT RefundRecord
    Backend->Database: UPDATE RefundRecord
    Backend->Database: SELECT ShopifyAccess
    Backend->>Shop: mut resolveRefundSession
    Shop-->>Backend: 200 Ok
    Backend->Database: UPDATE RefundRecord
```

## Database Schema

### Shopify Access

|    name     |  type  |               notes               |
| :---------: | :----: | :-------------------------------: |
|     id      |  Int   |         Autogenerated ID          |
| accessToken | String |            Auth Token             |
|   scopes    | String | Scopes returned with access token |

### Payment Record

|   name    |  type  |               notes               |
| :-------: | :----: | :-------------------------------: |
| paymentId | String |        Given From Shopify         |
| shopifyId | String |            Auth Token             |
|  amount   | String | Scopes returned with access token |
