/*
  Warnings:

  - You are about to alter the column `createdAt` on the `TransactionRecord` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `DateTime(3)`.

*/
-- AlterTable
ALTER TABLE `Merchant` ADD COLUMN `acceptedTermsAndConditions` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `dismissCompleted` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `name` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `PaymentRecord` ADD COLUMN `completedAt` DATETIME(3) NULL,
    ADD COLUMN `requestedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);

-- AlterTable
ALTER TABLE `RefundRecord` ADD COLUMN `completedAt` DATETIME(3) NULL,
    ADD COLUMN `requestedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);

-- AlterTable
ALTER TABLE `TransactionRecord` MODIFY `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);
