# Merchant UI APIs

## Read Data

### /merchant-data

```
{
    merchantData: {
        name: string
        paymentAddress: string
        onboarding: {
            completed: bool
            acceptedTerms: bool
            addedWallet: bool
            dismissedCompleted: bool
            kybState: "new" | "pending" | "completed"
        }
    }
    general: {
        refundBadges: int
    }
}
```

### /payment-data

query parameters:

pageNumber: int
pageSize: int

```
{
    paymentData: {
        page: int,
        pageSize: int,
        total: int,
        data: {
            shopifyOrder: string
            date: string
            status: 'pending' | 'paid' | 'completed' | 'rejected'
            amount: float
        }[],
    }
    general: {
        refundBadges: int
    }
}
```

### /refund-data

query parameters:

pageNumber: int
pageSize: int

```
{
    refundData: {
        page: int,
        pageSize: int,
        total: int,
        data: {
            shopifyOrder: string
            date: string
            status: 'pending' | 'paid' | 'completed' | 'rejected'
            amount: float
        }[],
    }
    general: {
        refundBadges: int
    }
}
```

## Write Data

### /reject-refund

body:

refundId: string
merchantReason: string
