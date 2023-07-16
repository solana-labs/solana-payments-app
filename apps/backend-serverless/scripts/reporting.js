import { PrismaClient } from '@prisma/client';
import fs from 'fs';
const prisma = new PrismaClient();

async function generateReport() {
    // Get current month and year
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    // Filter payments and refunds for current month
    const payments = await prisma.paymentRecord.findMany({
        where: {
            AND: [
                { requestedAt: { gte: new Date(currentYear, currentMonth, 1) } },
                { requestedAt: { lt: new Date(currentYear, currentMonth + 1, 1) } },
                { status: 'completed' },
            ],
        },
    });

    const refunds = await prisma.refundRecord.findMany({
        where: {
            AND: [
                { requestedAt: { gte: new Date(currentYear, currentMonth, 1) } },
                { requestedAt: { lt: new Date(currentYear, currentMonth + 1, 1) } },
                { status: 'completed' },
            ],
        },
    });

    // Calculate metrics
    const totalSalesVolume = payments.reduce((sum, payment) => sum + payment.amount, 0);
    const totalTransactions = payments.length;
    const averageTransactionSize = totalSalesVolume / totalTransactions;

    const totalRefundVolume = refunds.reduce((sum, refund) => sum + refund.amount, 0);
    const totalRefunds = refunds.length;

    const activeMerchants = new Set(payments.map(payment => payment.merchantId)).size;

    // Prepare data for CSV
    const data = [
        {
            totalSalesVolume,
            totalTransactions,
            averageTransactionSize,
            totalRefundVolume,
            totalRefunds,
            activeMerchants,
        },
    ];

    // Define CSV header and body
    const header =
        'Total Sales Volume,Total Transactions,Average Transaction Size,Total Refund Volume,Total Refunds,Active Merchants\n';
    const body = data
        .map(
            d =>
                `$${d.totalSalesVolume},${d.totalTransactions},$${d.averageTransactionSize},$${d.totalRefundVolume},${d.totalRefunds},${d.activeMerchants}`,
        )
        .join('\n');

    // Write to CSV
    fs.writeFile('reports/aggregate_stats.csv', header + body, err => {
        if (err) {
            console.error(err);
        } else {
            console.log('The aggregate stats CSV file was written successfully');
        }
    });

    // Generate per-merchant stats
    const merchantIds = Array.from(new Set(payments.map(payment => payment.merchantId)));
    const merchantData = merchantIds.map(merchantId => {
        const merchantPayments = payments.filter(payment => payment.merchantId === merchantId);
        const merchantRefunds = refunds.filter(refund => refund.merchantId === merchantId);

        return {
            merchantId,
            totalSalesVolume: merchantPayments.reduce((sum, payment) => sum + payment.amount, 0),
            totalTransactions: merchantPayments.length,
            averageTransactionSize: totalSalesVolume / merchantPayments.length || 0,
            totalRefundVolume: merchantRefunds.reduce((sum, refund) => sum + refund.amount, 0),
            totalRefunds: merchantRefunds.length,
        };
    });

    // Define CSV header and body
    const merchantHeader =
        'Merchant ID,Total Sales Volume,Total Transactions,Average Transaction Size,Total Refund Volume,Total Refunds\n';
    const merchantBody = merchantData
        .map(
            d =>
                `${d.merchantId},$${d.totalSalesVolume},${d.totalTransactions},$${d.averageTransactionSize},$${d.totalRefundVolume},${d.totalRefunds}`,
        )
        .join('\n');

    // Write to CSV
    fs.writeFile('reports/merchant_stats.csv', merchantHeader + merchantBody, err => {
        if (err) {
            console.error(err);
        } else {
            console.log('The merchant stats CSV file was written successfully');
        }
    });
}

generateReport().catch(e => {
    console.error(e);
    process.exit(1);
});
