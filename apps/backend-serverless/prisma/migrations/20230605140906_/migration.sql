-- DropForeignKey
ALTER TABLE `PaymentRecord` DROP FOREIGN KEY `PaymentRecord_merchantId_fkey`;

-- DropForeignKey
ALTER TABLE `RefundRecord` DROP FOREIGN KEY `RefundRecord_merchantId_fkey`;

-- DropForeignKey
ALTER TABLE `RefundRecord` DROP FOREIGN KEY `RefundRecord_shopPaymentId_fkey`;

-- DropForeignKey
ALTER TABLE `TransactionRecord` DROP FOREIGN KEY `TransactionRecord_paymentRecordId_fkey`;

-- DropForeignKey
ALTER TABLE `TransactionRecord` DROP FOREIGN KEY `TransactionRecord_refundRecordId_fkey`;
