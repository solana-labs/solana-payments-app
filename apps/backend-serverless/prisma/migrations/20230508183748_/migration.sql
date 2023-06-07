/*
  Warnings:

  - You are about to alter the column `type` on the `TransactionRecord` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Enum("TransactionRecord_type")`.

*/
-- AlterTable
ALTER TABLE `TransactionRecord` ADD COLUMN `refundRecordId` INTEGER NULL,
    MODIFY `type` ENUM('payment', 'refund') NOT NULL;

-- CreateTable
CREATE TABLE `RefundRecord` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `status` VARCHAR(191) NOT NULL,
    `amount` DOUBLE NOT NULL,
    `currency` VARCHAR(191) NOT NULL,
    `shopId` VARCHAR(191) NOT NULL,
    `shopGid` VARCHAR(191) NOT NULL,
    `shopPaymentId` VARCHAR(191) NOT NULL,
    `test` BOOLEAN NOT NULL,
    `merchantId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `TransactionRecord` ADD CONSTRAINT `TransactionRecord_refundRecordId_fkey` FOREIGN KEY (`refundRecordId`) REFERENCES `RefundRecord`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RefundRecord` ADD CONSTRAINT `RefundRecord_merchantId_fkey` FOREIGN KEY (`merchantId`) REFERENCES `Merchant`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
