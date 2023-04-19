# Payments App System Design

This doc should serve as the starting point of the system design for the Solana Payment App.

Note: Given we are in the very early stages of development, this should change over time with the build out.

## Components

-   Backend App - Orcastration logic that connects merchants to consumers who want to complete a payment over the Solana network
-   Mertchant UI - General merchant managment portal
-   Payment UI - UI for completing a payment on Solana, lightly coupled to the Solana Payments Appp
-   Transaction Request Server - Generalized transaction building engine for payments
-   Commerce Protocol - Lightweight on chain entities and actions to paticipate in commerce

## System Design Goals

-   Serve multiple platforms with reusable infrastructure
-   Leverage Solana where possible to remove dependecies on hosted services
-   Easy to deploy and host your own instance of the payments app

## Main Flows

-   Payment Flow
-   Refund Flow
-   Auth Flow

### Payment Flow

```mermaid
sequenceDiagram
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
    BACKEND->TRS: /paymentRecord
    TRS-->>BACKEND: 200 { tx: string, message: string }
    BACKEND->S3: fetch platform authority keypair
    BACKEND->BACKEND: sign transaction
    BACKEND->Solana: sendRawTransaction
    BACKEND->DATABASE: CREATE PaymentRecord
    BACKEND->>SHOP: 200 { redirect_url: string }
    SHOP->>Alice: 301 { redirect_url: string }
    Alice->>BACKEND: /transaction
    BACKEND->DATABASE: SELECT PaymentRecord
    BACKEND->>TRS: /transaction
    TRS-->>BACKEND: 200 { tx: string, message: string }
    BACKEND->>TRM: /riskApi
    TRM-->>BACKEND: 200 { riskLevel: int }
    BACKEND->S3: fetch gas keypair
    BACKEND->BACKEND: sign transaction
    BACKEND->>DATABASE: UPDATE PaymentRecord
    BACKEND->>Alice: 200 { tx: string, message: string }
    Alice->>Wallet: signTransaction
    Wallet->>Alice: signed transaction
    Alice->>Solana: sendRawTransaction
    Helius->>BACKEND: /helius
    BACKEND->DATABASE: SELECTT PaymentRecord
    BACKEND->DATABASE: UPDATE PaymentRecord
    BACKEND->DATABASE: SELECT ShopifyAccess
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
