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

-- AddForeignKey
ALTER TABLE `PaymentRecord` ADD CONSTRAINT `PaymentRecord_merchantId_fkey` FOREIGN KEY (`merchantId`) REFERENCES `Merchant`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RefundRecord` ADD CONSTRAINT `RefundRecord_shopPaymentId_fkey` FOREIGN KEY (`shopPaymentId`) REFERENCES `PaymentRecord`(`shopId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RefundRecord` ADD CONSTRAINT `RefundRecord_merchantId_fkey` FOREIGN KEY (`merchantId`) REFERENCES `Merchant`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TransactionRecord` ADD CONSTRAINT `TransactionRecord_paymentRecordId_fkey` FOREIGN KEY (`paymentRecordId`) REFERENCES `PaymentRecord`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TransactionRecord` ADD CONSTRAINT `TransactionRecord_refundRecordId_fkey` FOREIGN KEY (`refundRecordId`) REFERENCES `RefundRecord`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
