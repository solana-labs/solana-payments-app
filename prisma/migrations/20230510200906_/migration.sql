/*
  Warnings:

  - You are about to drop the column `customerAddress` on the `PaymentRecord` table. All the data in the column will be lost.
  - You are about to drop the column `customerAddress` on the `RefundRecord` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `PaymentRecord` DROP COLUMN `customerAddress`;

-- AlterTable
ALTER TABLE `RefundRecord` DROP COLUMN `customerAddress`,
    ADD COLUMN `transactionSignature` VARCHAR(191) NULL;
