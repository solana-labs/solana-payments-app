# Payments App System Design

This doc should serve as the starting point of the system design for the Solana Payment App.

Note: Given we are in the very early stages of development, this should change over time with the build out.

## Components

<<<<<<< HEAD
- Backend - Orcastration logic that connects merchants to consumers who want to complete a payment over the Solana network
- Mertchant UI - General merchant managment portal
- Payment UI - UI for completing a payment on Solana, lightly coupled to the Solana Payments Appp
- Transaction Request Server - Generalized transaction building engine for payments
=======
-   Backend - Orcastration logic that connects merchants to consumers who want to complete a payment over the Solana network
-   Mertchant UI - General merchant managment portal
-   Payment UI - UI for completing a payment on Solana, lightly coupled to the Solana Payments Appp
-   Transaction Request Server - Generalized transaction building engine for payments
>>>>>>> main

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
    BACKEND->>TRS: /pay
    TRS-->>BACKEND: 200 { tx: string, message: string }
    BACKEND->>TRM: /riskApi
    TRM-->>BACKEND: 200 { riskLevel: int }
    BACKEND->S3: fetch gas keypair
    BACKEND->BACKEND: sign transaction
    BACKEND->>DATABASE: CREATE TransactionRecord
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
    BACKEND->DATABASE: SELECT TransactionRecord
    BACKEND->DATABASE: SELECT PaymentRecord
    BACKEND->BACKEND: Validate transaction wrt PaymentRecord
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

The Refund Flow is broken up into two phases.

Phase One: The merchant initates a refund for a customer. Shoify notifies of of the refund that needs to be proccessed.

Phase Two: The merchant starts the process of completing a pending refund on our merchant-ui.

Phase Three: We discover a completed transaction. Figure out what refund it's for and notify Shopify it's been completed.

```mermaid
sequenceDiagram
    title Refund Flow: Phase One
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
    participant TRM as TRM Labs
    participant TRS as Transaction Request Server
    Merchant-xShop: initiate a refund
    Shop->>Backend: /refund
    Backend->Database: SELECT PaymentRecord
    Backend->Database: CREATE RefundRecord
    Backend->Database: UPDATE PaymentRecord
    Backend->>Shop: 200 Ok
```

```mermaid
sequenceDiagram
    title Refund Flow: Phase Two
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
    participant TRM as TRM Labs
    participant TRS as Transaction Request Server
    Merchant-xPortal: visits the merhcant portal
    Portal->>Backend: /refunds
    Backend->>Database: SELECT RefundRecord
    Backend-->>Portal: 200 { refunds: [ ... ] }
    Merchant-xPortal: select refund to process
    Portal->>Backend: /refund-transaction
    Backend->Database: SELECT RefundRecord
    Backend->TRS: /pay
    TRS-->>Backend: 200 { tx: string, message: string }
    BACKEND->>TRM: /riskApi
    TRM-->>BACKEND: 200 { riskLevel: int }
    Backend->S3: fetch gas keypair
    Backend->>Backend: sign transaction
    BACKEND->>DATABASE: CREATE TransactionRecord
    Backend-->>Portal: 200 { tx: string, message: string }
```

```mermaid
sequenceDiagram
    title Refund Flow: Phase Three
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
    participant TRM as TRM Labs
    participant TRS as Transaction Request Server
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

<<<<<<< HEAD
=======
# <<<<<<< HEAD

### Refund Flow

```mermaid
sequenceDiagram
    title Refund Flow: Phase Three
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

>>>>>>> main
### Auth Flow

```mermaid
sequenceDiagram
    title Auth Flow
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
```

## Database Schema

### Merchant

|    name     |  type  |           notes            |
| :---------: | :----: | :------------------------: |
|     id      |  Int   |      Autogenerated ID      |
|    shop     | String |    Shopify Merhcant Id     |
| accessToken | String |    Shopify Access Token    |
|   scopes    | String | Most Recent Shopify Scopes |
|  lastNonce  | String |   Most Recent Auth Nonce   |

### PaymentRecord

|      name       |  type   |                            notes                            |
| :-------------: | :-----: | :---------------------------------------------------------: |
|     status      | String  |              tracks the progress of a payment               |
|   merchantId    | String  |              links the merchant to the payment              |
|     amount      | Number  | how much fiat the payment was for in the currency specified |
|    currency     | String  |             currency that the amount specifies              |
|     shopId      | String  |            'id' value passed to us from shopify             |
|     shopGid     | String  |            'gid' value passed to us from shopify            |
|    shopGroup    | String  |           'group' value passed to us from shopify           |
|      test       |  Bool   |            payment is just for merchant testing             |
|       id        | String  |                     internal unique id                      |
|  transactionId  | String? |      links the payment to the transaction that paid it      |
| customerAddress | String? |            customer we attribute to the payment             |

### RefundRecord

|      name       |  type   |                           notes                            |
| :-------------: | :-----: | :--------------------------------------------------------: |
|     status      | String  |              tracks the progress of a refund               |
|   merchantId    | String  |              links the merchant to the refund              |
|     amount      | String  | how much fiat the refund was for in the currency specified |
|    currency     | String  |             currency that the amount specifies             |
|     shopId      | String  |            'id' value passed to us from shopify            |
|     shopGid     | String  |           'gid' value passed to us from shopify            |
|  shopPaymentId  | String  |        'payment_id' value passed to us from shopify        |
|      test       |  Bool   |            refund is just for merchant testing             |
|       id        | String  |                     internal unique id                     |
|  transactionId  | String? |      links the refund to the transaction that paid it      |
| customerAddress | String  |            customer we attribute to the refund             |

### TransactionRecord

|      name       |  type   |                     notes                      |
| :-------------: | :-----: | :--------------------------------------------: |
|    signature    | String  |             transaction Signature              |
|      type       | String  |             'payment' or 'refund'              |
|    createdAt    | String  | timestamp the transaction was built and signed |
| paymentRecordId | String? |      links the transaction to the payment      |
| refundRecordId  | String? |      links the transaction to the refund       |
