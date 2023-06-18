import { PaymentRecordStatus, PrismaClient, RefundRecordStatus } from '@prisma/client';
import { SEED_DATA } from './data.js';

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
    const records = [];

    for (let i = 0; i < count; i++) {
        let merchant;
        if (i === 0) {
            merchant = {
                id: `merchant-${i}`,
                shop: `localhost:4004`,
                name: `Merchant ${i}`,
                accessToken: `access-token-${i}`,
                scopes: 'write_payment_gateways,write_payment_sessions',
                lastNonce: `nonce-${i}`,
                paymentAddress: 'JAiArByfpjM3CKYms47FGNEqxuwDpJ93vDj9wGmQenJr',
                kybInquiry: `inq_${i}`,
                kybState: 'finished',
                acceptedTermsAndConditions: true,
                dismissCompleted: false,
                active: true,
            };
        } else {
            merchant = {
                id: `merchant-${i}`,
                shop: `store${i}.myshopify.com`,
                name: `Merchant ${i}`,
                accessToken: `access-token-${i}`,
                scopes: 'write_payment_gateways,write_payment_sessions',
                lastNonce: `nonce-${i}`,
                paymentAddress: 'JAiArByfpjM3CKYms47FGNEqxuwDpJ93vDj9wGmQenJr',
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

function generatePaymentRecords(merchant = 1, count = 1): any[] {
    const records = [];

    for (let i = 0; i < merchant; i++) {
        for (let j = 0; j < count; j++) {
            const date = new Date();
            date.setDate(date.getDate() + j); // adding 'j' days to the current date

            const record = {
                id: `payment-1${j}`,
                status: 'pending',
                shopId: `r_1${j}_shopid`,
                shopGid: `gid://shopify/PaymentSession/r_1${j}_shopid`,
                shopGroup: `shop_group_1${j}`,
                test: 1,
                amount: j + 1,
                currency: 'USD',
                usdcAmount: j + 1,
                cancelURL: `https://store${j}.myshopify.com/checkouts/c/randomId_${j}/processing`,
                merchantId: `merchant-${i}`,
                transactionSignature: `317CdVpw26TCBpgKdaK8siAG3iMHatFPxph47GQieaZYojo9Q4qNG8vJ3r2EsHUWGEieEgzpFYBPmrqhiHh6sjLt`,
                requestedAt: date.toISOString(), // setting requestedAt to the generated date
                completedAt: null,
            };

            records.push(record);
        }
        for (let j = 0; j < count; j++) {
            const requestedAt = new Date();
            requestedAt.setDate(requestedAt.getDate() + j); // adding 'j' days to the current date
            const completedAt = new Date(requestedAt.getTime());
            completedAt.setDate(completedAt.getDate() + 1); // completedAt is one day after requestedAt

            const record = {
                id: `payment-2${j}`,
                status: 'completed',
                shopId: `r_2${j}_shopid`,
                shopGid: `gid://shopify/PaymentSession/r_2${j}_shopid`,
                shopGroup: `shop_group_2${j}`,
                test: 1,
                amount: j + 1,
                currency: 'USD',
                usdcAmount: j + 1,
                cancelURL: `https://store${j}.myshopify.com/checkouts/c/randomId_${j}/processing`,
                merchantId: `merchant-${i}`,
                transactionSignature: `317CdVpw26TCBpgKdaK8siAG3iMHatFPxph47GQieaZYojo9Q4qNG8vJ3r2EsHUWGEieEgzpFYBPmrqhiHh6sjLt`,
                requestedAt: requestedAt.toISOString(),
                completedAt: completedAt.toISOString(),
            };

            records.push(record);
        }
    }
    return records;
}
function generateRefundRecords(merchant = 1, count = 1): any[] {
    const records = [];

    for (let i = 0; i < merchant; i++) {
        for (let j = 0; j < count; j++) {
            const date = new Date();
            date.setDate(date.getDate() + j); // adding 'j' days to the current date

            const record = {
                id: `refund-1${j}`,
                status: 'pending',
                amount: j,
                currency: 'USD',
                usdcAmount: j,
                shopId: `r_1${j}_shopid`,
                shopGid: `gid://shopify/PaymentSession/rwy_shopid_1${j}`,
                shopPaymentId: `r_1${j}_shopid`,
                test: 1,
                merchantId: `merchant-${i}`,
                requestedAt: date.toISOString(), // setting requestedAt to the generated date
                completedAt: null,
            };

            records.push(record);
        }
        for (let j = 0; j < count; j++) {
            const requestedAt = new Date();
            requestedAt.setDate(requestedAt.getDate() + j); // adding 'j' days to the current date
            const completedAt = new Date(requestedAt.getTime());
            completedAt.setDate(completedAt.getDate() + 1); // completedAt is one day after requestedAt

            const record = {
                id: `refund-2${j}`,
                status: 'completed',
                amount: j,
                currency: 'USD',
                usdcAmount: j,
                shopId: `r_2${j}_shopid`,
                shopGid: `gid://shopify/PaymentSession/r_2${j}_shopid`,
                shopPaymentId: `r_2${j}_shopid`,
                test: 1,
                merchantId: `merchant-${i}`,
                transactionSignature: `signature-${j}`,
                requestedAt: requestedAt.toISOString(),
                completedAt: completedAt.toISOString(),
            };

            records.push(record);
        }
    }
    return records;
}

async function insertJsonData() {
    const merchantInfo = await prisma.merchant.createMany({
        data: SEED_DATA.merchant.map(merchant => ({
            ...merchant,
        })),
    });

    const paymentRecords = await prisma.paymentRecord.createMany({
        data: SEED_DATA.paymentRecords.map(record => ({
            ...record,
            status: stringToPaymentRecordStatus(record.status),
            test: Boolean(record.test),
        })),
    });

    const refundRecords = await prisma.refundRecord.createMany({
        data: SEED_DATA.refundRecords.map(record => ({
            ...record,
            status: stringToRefundRecordStatus(record.status),
            test: Boolean(record.test),
        })),
    });
}

async function insertGeneratedData(count: number) {
    const merchantInfo = await prisma.merchant.createMany({
        data: generateMerchantRecords().map(merchant => ({
            ...merchant,
        })),
    });

    const paymentRecords = await prisma.paymentRecord.createMany({
        data: generatePaymentRecords(1, count).map(record => ({
            ...record,
            status: stringToPaymentRecordStatus(record.status),
            test: Boolean(record.test),
        })),
    });

    const refundRecords = await prisma.refundRecord.createMany({
        data: generateRefundRecords(1, count).map(record => ({
            ...record,
            status: stringToRefundRecordStatus(record.status),
            test: Boolean(record.test),
        })),
    });
}

async function main() {
    await prisma.$executeRaw`DELETE from Merchant;`;
    await prisma.$executeRaw`DELETE from PaymentRecord `;
    await prisma.$executeRaw`DELETE from RefundRecord `;

    // await prisma.$executeRaw`DROP TABLE Merchant;`;
    // await prisma.$executeRaw`DROP TABLE PaymentRecord `;
    // await prisma.$executeRaw`DROP TABLE RefundRecord `;

    await insertGeneratedData(10);
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
