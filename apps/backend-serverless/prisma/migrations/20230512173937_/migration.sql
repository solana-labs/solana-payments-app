/*
  Warnings:

  - The primary key for the `Merchant` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `PaymentRecord` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `RefundRecord` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- DropForeignKey
ALTER TABLE `PaymentRecord` DROP FOREIGN KEY `PaymentRecord_merchantId_fkey`;

-- DropForeignKey
ALTER TABLE `RefundRecord` DROP FOREIGN KEY `RefundRecord_merchantId_fkey`;

-- DropForeignKey
ALTER TABLE `TransactionRecord` DROP FOREIGN KEY `TransactionRecord_paymentRecordId_fkey`;

-- DropForeignKey
ALTER TABLE `TransactionRecord` DROP FOREIGN KEY `TransactionRecord_refundRecordId_fkey`;

-- AlterTable
ALTER TABLE `Merchant` DROP PRIMARY KEY,
    MODIFY `id` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `PaymentRecord` DROP PRIMARY KEY,
    MODIFY `id` VARCHAR(191) NOT NULL,
    MODIFY `merchantId` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `RefundRecord` DROP PRIMARY KEY,
    MODIFY `id` VARCHAR(191) NOT NULL,
    MODIFY `merchantId` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `TransactionRecord` MODIFY `paymentRecordId` VARCHAR(191) NULL,
    MODIFY `refundRecordId` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `PaymentRecord` ADD CONSTRAINT `PaymentRecord_merchantId_fkey` FOREIGN KEY (`merchantId`) REFERENCES `Merchant`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RefundRecord` ADD CONSTRAINT `RefundRecord_merchantId_fkey` FOREIGN KEY (`merchantId`) REFERENCES `Merchant`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TransactionRecord` ADD CONSTRAINT `TransactionRecord_paymentRecordId_fkey` FOREIGN KEY (`paymentRecordId`) REFERENCES `PaymentRecord`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TransactionRecord` ADD CONSTRAINT `TransactionRecord_refundRecordId_fkey` FOREIGN KEY (`refundRecordId`) REFERENCES `RefundRecord`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
