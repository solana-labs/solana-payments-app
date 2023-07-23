-- DropIndex
DROP INDEX `PaymentRecord_merchantId_fkey` ON `PaymentRecord`;

-- DropIndex
DROP INDEX `RefundRecord_merchantId_fkey` ON `RefundRecord`;

-- DropIndex
DROP INDEX `RefundRecord_shopPaymentId_fkey` ON `RefundRecord`;

-- DropIndex
DROP INDEX `TransactionRecord_paymentRecordId_fkey` ON `TransactionRecord`;

-- DropIndex
DROP INDEX `TransactionRecord_refundRecordId_fkey` ON `TransactionRecord`;

-- CreateTable
CREATE TABLE `GDPR` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `merchantId` VARCHAR(191) NOT NULL,
    `completed` BOOLEAN NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
