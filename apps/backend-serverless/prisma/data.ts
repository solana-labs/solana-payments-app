export const SEED_DATA = {
    merchant: [
        {
            id: 'HnWuBCBMZrug12qFG9t8b8KEoHbtGMq2X3EyyQZBLQqV',
            shop: 'store.myshopify.com',
            name: 'Merchant Store 1',
            accessToken: 'accessToken1',
            scopes: 'write_payment_gateways,write_payment_sessions',
            lastNonce: '7FANeBEwPGzvBvYFjP8oh95u16X7Uro4Ch7S7G6dSVgj',
            walletAddress: '2BYYZYvzjvk9cyyGm2ZcD433Kh4XnNQKnuppaKmFak4H',
            kybInquiry: 'inq_yyNQcbnQiZTeAQnxBD2qTcwu',
            kybState: 'finished',
            acceptedTermsAndConditions: true,
            dismissCompleted: false,
            active: false,
        },
    ],
    paymentRecords: [
        {
            id: '285p5m8dbLaXgCscZMV8BLwad6sbhLjjx2PxcRUV28Tb',
            status: 'pending',
            shopId: 'rWYhdTjSAjtgj0ozEVF1KyPki',
            shopGid: 'gid://shopify/PaymentSession/rWYhdTjSAjtgj0ozEVF1KyPki',
            shopGroup: '5fm9PJ4QApdCVDRVZlBzGh33OuW8dSXd2/mVPPPVRJE=',
            test: 1,
            amount: 9.9,
            currency: 'USD',
            usdcAmount: 9.90123765470684,
            cancelURL:
                'https://mtndao-merch-store.myshopify.com/checkouts/c/1202397ff85fc87ce875203def6ec138/processing',
            merchantId: 'HnWuBCBMZrug12qFG9t8b8KEoHbtGMq2X3EyyQZBLQqV',
            requestedAt: '2023-05-26T20:39:09.090Z',
            completedAt: null,
        },
        {
            id: '2rBGuzbY4uM95i4q6VGhQ5j9udSnyhqSzqSwLVjhnM3L',
            status: 'completed',
            shopId: 'rbYwcy2DhaFybRzfDDbqccFuF',
            shopGid: 'gid://shopify/PaymentSession/rbYwcy2DhaFybRzfDDbqccFuF',
            shopGroup: 'K5FR8y2Cf8gcadhvjsTCxaJenRWs+pwexjR1r4MvuWQ=',
            test: 1,
            amount: 9.9,
            currency: 'USD',
            usdcAmount: 9.9,
            cancelURL:
                'https://mtndao-merch-store.myshopify.com/checkouts/c/f1beab66e593c0f7442dd0aeebf94f52/processing',
            merchantId: 'HnWuBCBMZrug12qFG9t8b8KEoHbtGMq2X3EyyQZBLQqV',
            transactionSignature:
                '3FHST87NUj9HEJa14X2AKm3pJDohv2HoP3aZvusTonNjRTaBAsMwzfyrHdZEJihKKGK7X8gJTrbvpNYRjiXRYgvt',
            redirectUrl:
                'https://mtndao-merch-store.myshopify.com/checkouts/c/f1beab66e593c0f7442dd0aeebf94f52/processing?completed=true',
            requestedAt: '2023-05-26T06:47:28.243Z',
            completedAt: '2023-05-26T06:47:57.920Z',
        },
        {
            id: '4Q3qMcaeWNXURgxDqbkJavWV62zyACDu4puevmtWeMz1',
            status: 'completed',
            shopId: 'r3IJJhk2KvRXnBQRCrxMkfpfs',
            shopGid: 'gid://shopify/PaymentSession/r3IJJhk2KvRXnBQRCrxMkfpfs',
            shopGroup: 'zLokMKGdxPAxonBwHVkeA1IDm7nO2R7MaYk3F9S5go0=',
            test: 1,
            amount: 9.9,
            currency: 'USD',
            usdcAmount: 9.9,
            cancelURL:
                'https://mtndao-merch-store.myshopify.com/checkouts/c/4079b7243d4f9f680f6618a69385f90e/processing',
            merchantId: 'HnWuBCBMZrug12qFG9t8b8KEoHbtGMq2X3EyyQZBLQqV',
            transactionSignature:
                '3XgrXzf6D69Qqe1RQYuTQfrWeW6mhjE85zAMtM4kAk6NohHveLKYRWWR732hXzFPdb7C1iEsBsZtFG8o4BFvjgNo',
            redirectUrl:
                'https://mtndao-merch-store.myshopify.com/checkouts/c/4079b7243d4f9f680f6618a69385f90e/processing?completed=true',
            requestedAt: '2023-05-26T06:44:48.933Z',
            completedAt: '2023-05-26T06:45:15.799Z',
        },
        {
            id: '6bepKnDJLiG1XYdHZK6DZ7yhG1va1zKXbnEhTX2TSNui',
            status: 'pending',
            shopId: 'rihLTUpC8gXbcUhFFgrRhMDPC',
            shopGid: 'gid://shopify/PaymentSession/rihLTUpC8gXbcUhFFgrRhMDPC',
            shopGroup: 'g9KH8jeNzlzrFMKl50V2C/PqOjq4L2csV6E+J8VT2Nc=',
            test: 1,
            amount: 9.9,
            currency: 'USD',
            usdcAmount: 9.90088117842488,
            cancelURL:
                'https://mtndao-merch-store.myshopify.com/checkouts/c/1202397ff85fc87ce875203def6ec138/processing',
            merchantId: 'HnWuBCBMZrug12qFG9t8b8KEoHbtGMq2X3EyyQZBLQqV',
            requestedAt: '2023-05-26T20:36:39.427Z',
        },
    ],
    refundRecords: [
        {
            id: '4pQ33648hhzT2WLXx8XeRhHKCUB1c88jbceHteZ8wnzE',
            status: 'paid',
            amount: 10,
            currency: 'USD',
            shopId: 'rWYhdTjSAjtgj0ozEVF1KyPkeqwr',
            shopGid: 'gid://shopify/PaymentSession/rWYhdTjSAjtgj0ozEVF1KyPki',
            shopPaymentId: 'rWYhdTjSAjtgj0ozEVF1KyPki',
            test: 1,
            requestedAt: '2023-05-26T22:41:09.090Z',
            completedAt: '2023-05-26T23:42:09.090Z',
            merchantId: 'HnWuBCBMZrug12qFG9t8b8KEoHbtGMq2X3EyyQZBLQqV',
            usdcAmount: 9,
        },
        {
            id: '9ZYUfSYdoY8GbaLppK19FKNLVPvkdjgiTb35H918BPVw',
            status: 'paid',
            amount: 14.9,
            currency: 'USD',
            shopId: '3WGmoEAQKAyww-LgQ8YB5bPY',
            shopGid: 'gid://shopify/RefundSession/3WGmoEAQKAyww-LgQ8YB5bPY',
            shopPaymentId: 'rbYwcy2DhaFybRzfDDbqccFuF',
            test: 1,
            merchantId: 'HnWuBCBMZrug12qFG9t8b8KEoHbtGMq2X3EyyQZBLQqV',
            transactionSignature:
                '2Bg6UHLUZyifetD1fyCbgjVAEuwp24tj1tQ18LKrPn4fmSqKuEDXdQYABuns1Ny8DByPBN5FGGzdYkAPtYKGAgSB',
            requestedAt: '2023-05-26T04:56:16.956Z',
            completedAt: '2023-05-26T06:39:08.374Z',
            usdcAmount: 14.90809509563693,
        },
        {
            id: 'BbVYL6QEGtGXr6RSmaTPhohqe7ZwzPAgTS9ZPxND7zKt',
            status: 'rejected',
            amount: 9.9,
            currency: 'USD',
            shopId: 'IvpNlUIAYQ_tvJDLhGEiPoaC',
            shopGid: 'gid://shopify/RefundSession/IvpNlUIAYQ_tvJDLhGEiPoaC',
            shopPaymentId: 'r3IJJhk2KvRXnBQRCrxMkfpfs',
            test: 1,
            merchantId: 'HnWuBCBMZrug12qFG9t8b8KEoHbtGMq2X3EyyQZBLQqV',
            requestedAt: '2023-05-26T06:48:21.555Z',
            usdcAmount: 9.9,
        },
        {
            id: 'DkQEZCRGJUu3urEkCaRjjToBAvMcee79YfisGy4DfiUk',
            status: 'pending',
            amount: 15,
            currency: 'USD',
            shopId: 'gKvqVZtga9TnQTu9bjwQ-4iQ',
            shopGid: 'gid://shopify/RefundSession/gKvqVZtga9TnQTu9bjwQ-4iQ',
            shopPaymentId: 'rihLTUpC8gXbcUhFFgrRhMDPC',
            test: 1,
            merchantId: 'HnWuBCBMZrug12qFG9t8b8KEoHbtGMq2X3EyyQZBLQqV',
            requestedAt: '2023-05-25T21:53:10.413Z',
            usdcAmount: 15.00528185921444,
        },
    ],
};
