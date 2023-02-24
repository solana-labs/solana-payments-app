# Payments App System Design

This doc should serve as the starting point of the system design for the Solana Payment App.

Note: Given we are in the very early stages of development, this should change over time with the build out.

## Components

The Solana Payments App is designed around a few pieces of software that work together

1. Backend App - Orcastration logic that connects merchants -> consumers who want to complete a payment over the Solana network
2. Mertchant UI - General merchant managment portal
3. Payment UI - UI for completing a payment on Solana, lightly coupled to the Solana Payments Appp
4. Transaction Request Server - Generalized transaction building engine for payments
5. Commerce Protocol - Lightweight on chain entities and actions to paticipate in commerce

## System Design Goals.

-   Serve multiple platforms with reuable infrastructure. Some platoforms may use all of the infrastruture, some may only use parts. For example, a point of sale may avoid the payment ui and replace that with their own, client side ui.
-   Easy to redeploy and host your own instance of the payments app.
-   Leverage Solana where possible to remove dependecies of hosted services.

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
