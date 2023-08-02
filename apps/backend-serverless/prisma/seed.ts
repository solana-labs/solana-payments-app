import { PaymentRecordStatus, PrismaClient, RefundRecordStatus } from '@prisma/client';

const prisma = new PrismaClient();

function stringToPaymentRecordStatus(status: string): PaymentRecordStatus {
    switch (status) {
        case 'completed':
            return PaymentRecordStatus.completed;
        case 'pending':
            return PaymentRecordStatus.pending;
        case 'rejected':
            return PaymentRecordStatus.rejected;
        case 'paid':
            return PaymentRecordStatus.paid;
        default:
            throw new Error(`Invalid status value: ${status}`);
    }
}

function stringToRefundRecordStatus(status: string): RefundRecordStatus {
    switch (status) {
        case 'completed':
            return RefundRecordStatus.completed;
        case 'pending':
            return RefundRecordStatus.pending;
        case 'rejected':
            return RefundRecordStatus.rejected;
        case 'paid':
            return RefundRecordStatus.paid;
        default:
            throw new Error(`Invalid status value: ${status}`);
    }
}

function generateMerchantRecords(count = 1): any[] {
    const records: any[] = [];

    for (let i = 0; i < count; i++) {
        let merchant;
        if (i === 0) {
            merchant = {
                id: `GZQN3FYe8WGLTWSBGDgprSfJmwwDrYNPL2vR2v9ZpJof`,
                shop: `localhost:4004`,
                name: `Merchant ${i}`,
                accessToken: `access-token-${i}`,
                scopes: 'write_payment_gateways,write_payment_sessions,unauthenticated_read_product_listings',
                lastNonce: `nonce-${i}`,
                walletAddress: '9CAaGmubCCGSii1a6XEsJJCtQggVUJqSb1wAaEne11rT',
                tokenAddress: null,
                kybInquiry: `inq_${i}`,
                kybState: 'finished',
                acceptedTermsAndConditions: true,
                acceptedPrivacyPolicy: true,
                dismissCompleted: true,
                active: true,
                loyaltyProgram: 'tiers',
                pointsMint: 'Fq2oteAH3w4qKfDtnrdHTqVNRoUAWwMHSqeG7gsRqPSC',
                pointsBack: 1,
            };
        } else {
            merchant = {
                id: `merchant-${i}`,
                shop: `store${i}.myshopify.com`,
                name: `Merchant ${i}`,
                accessToken: `access-token-${i}`,
                scopes: 'write_payment_gateways,write_payment_sessions,unauthenticated_read_product_listings',
                lastNonce: `nonce-${i}`,
                walletAddress: 'JAiArByfpjM3CKYms47FGNEqxuwDpJ93vDj9wGmQenJr',
                tokenAddress: null,
                kybInquiry: `inq_${i}`,
                kybState: 'finished',
                acceptedTermsAndConditions: false,
                dismissCompleted: false,
                active: true,
            };
        }

        records.push(merchant);
    }
    return records;
}

function generatePaymentRecords(count = 1): any[] {
    const records: any[] = [];
    for (let i = 0; i < count; i++) {
        const requestedAt = new Date();
        requestedAt.setDate(requestedAt.getDate() + i);
        const completedAt = new Date(requestedAt.getTime());
        completedAt.setDate(completedAt.getDate() + i + 1);

        const record = {
            id: `payment-${i}`,
            status: 'completed',
            shopId: `r_2-${i}_shopid`,
            shopGid: `gid://shopify/PaymentSession/r_${i}_shopid`,
            shopGroup: `shop_group_${i}`,
            test: 1,
            amount: i + 1,
            currency: 'USD',
            usdcAmount: i + 1,
            cancelURL: `https://store${i}.myshopify.com/checkouts/c/randomId_-${i}/processing`,
            merchantId: `GZQN3FYe8WGLTWSBGDgprSfJmwwDrYNPL2vR2v9ZpJof`,
            transactionSignature: `317CdVpw26TCBpgKdaK8siAG3iMHatFPxph47GQieaZYojo9Q4qNG8vJ3r2EsHUWGEieEgzpFYBPmrqhiHh6sjLt`,
            requestedAt: requestedAt.toISOString(),
            completedAt: completedAt.toISOString(),
        };

        records.push(record);
    }
    return records;
}

function generateRefundRecords(paymentRecords: any[]): any[] {
    const records: any[] = [];

    for (let i = 0; i < paymentRecords.length; i++) {
        const paymentRecord = paymentRecords[i];
        const requestedAt = new Date(paymentRecord.requestedAt);
        const completedAt = new Date(paymentRecord.completedAt);

        const record = {
            id: `refund-${i}`,
            status: i % 2 === 0 ? 'pending' : 'completed',
            amount: i,
            currency: 'USD',
            usdcAmount: i,
            shopId: `r_${i}_shopid`,
            shopGid: `gid://shopify/PaymentSession/r_${i}_shopid`,
            shopPaymentId: paymentRecord.shopId,
            test: 1,
            merchantId: paymentRecord.merchantId,
            transactionSignature: i % 2 === 0 ? null : `signature-${i}`,
            requestedAt: requestedAt.toISOString(),
            completedAt: i % 2 === 0 ? null : completedAt.toISOString(),
        };

        records.push(record);
    }
    return records;
}

function generateProductRecords(count = 2): any[] {
    const records: any[] = [
        {
            id: '1',
            name: `Blue Snow Board`,
            image: 'https://cdn.shopify.com/s/files/1/0798/3752/8383/files/Main.jpg?v=1690255438',
            merchantId: `GZQN3FYe8WGLTWSBGDgprSfJmwwDrYNPL2vR2v9ZpJof`,
            active: true,
            mint: '8irVXZ22bYRCFeo4VpzQkyVN8dcgfoWWzMLvR34EXjcb',
        },
        {
            id: '2',
            name: `Purple Snow Board`,
            image: 'https://cdn.shopify.com/s/files/1/0798/3752/8383/products/Main_5127218a-8f6c-498f-b489-09242c0fab0a.jpg?v=1690255438',
            merchantId: `GZQN3FYe8WGLTWSBGDgprSfJmwwDrYNPL2vR2v9ZpJof`,
            active: true,
            mint: '3EeiqqW2oBb8qy4GpfcqrDzqefDkpUYkPi214vFaZvwH',
        },
        {
            id: '3',
            name: `Green Snow Board`,
            image: 'https://cdn.shopify.com/s/files/1/0798/3752/8383/products/Main_0a4e9096-021a-4c1e-8750-24b233166a12.jpg?v=1690255438',
            merchantId: `GZQN3FYe8WGLTWSBGDgprSfJmwwDrYNPL2vR2v9ZpJof`,
            active: false,
        },
    ];

    return records;
}

function generateTierRecords(count = 2): any[] {
    const records: any[] = [
        {
            name: `Tier 0`,
            threshold: 100,
            discount: 10,
            merchantId: `GZQN3FYe8WGLTWSBGDgprSfJmwwDrYNPL2vR2v9ZpJof`,
            active: true,
            mint: '6rEHh7ZPV238LbvaUfQKLSBUsJoCYsaMPqTH1QdQ79dB',
        },
    ];

    // for (let i = 1; i < count; i++) {
    //     let record = {
    //         name: `Tier ${i}`,
    //         threshold: 100 * (i + 1),
    //         discount: 10 * (i + 1),
    //         merchantId: `merchant-${0}`,
    //         active: false,
    //     };
    //     records.push(record);
    // }
    return records;
}

async function insertGeneratedData(merchants: number, payments: number, products: number, tiers: number) {
    const merchantInfo = await prisma.merchant.createMany({
        data: generateMerchantRecords(merchants).map(merchant => ({
            ...merchant,
        })),
    });

    const paymentRecords = await prisma.paymentRecord.createMany({
        data: generatePaymentRecords(payments).map(record => ({
            ...record,
            status: stringToPaymentRecordStatus(record.status),
            test: Boolean(record.test),
        })),
    });

    const refundRecords = await prisma.refundRecord.createMany({
        data: generateRefundRecords(generatePaymentRecords(payments)).map(record => ({
            ...record,
            status: stringToRefundRecordStatus(record.status),
            test: Boolean(record.test),
        })),
    });

    const productRecords = await prisma.product.createMany({
        data: generateProductRecords(products).map(record => ({
            ...record,
        })),
    });

    const tierRecords = await prisma.tier.createMany({
        data: generateTierRecords(tiers).map(record => ({
            ...record,
        })),
    });
}

async function main() {
    // await prisma.$executeRaw`DROP TABLE Merchant;`;
    // await prisma.$executeRaw`DROP TABLE PaymentRecord `;
    // await prisma.$executeRaw`DROP TABLE RefundRecord `;
    // await prisma.$executeRaw`DROP TABLE Tier `;
    // await prisma.$executeRaw`DROP TABLE Product `;
    // await prisma.$executeRaw`DROP TABLE WebsocketSession `;
    // await prisma.$executeRaw`DROP TABLE GDPR `;

    await prisma.$executeRaw`DELETE from Merchant;`;
    await prisma.$executeRaw`DELETE from PaymentRecord `;
    await prisma.$executeRaw`DELETE from RefundRecord `;
    await prisma.$executeRaw`DELETE from TransactionRecord `;
    await prisma.$executeRaw`DELETE from WebsocketSession `;
    await prisma.$executeRaw`DELETE from Tier `;
    await prisma.$executeRaw`DELETE from Product `;
    await prisma.$executeRaw`DELETE from GDPR `;

    await insertGeneratedData(1, 4, 4, 4);
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
