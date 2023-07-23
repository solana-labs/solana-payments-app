/*
  Warnings:

  - You are about to alter the column `status` on the `PaymentRecord` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Enum(EnumId(0))`.
  - You are about to alter the column `status` on the `RefundRecord` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Enum(EnumId(1))`.
  - Added the required column `usdcAmount` to the `RefundRecord` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Merchant` ADD COLUMN `email` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `PaymentRecord` MODIFY `status` ENUM('pending', 'paid', 'completed', 'rejected') NOT NULL;

-- AlterTable
ALTER TABLE `RefundRecord` ADD COLUMN `usdcAmount` DOUBLE NOT NULL,
    MODIFY `status` ENUM('pending', 'paid', 'completed', 'rejected') NOT NULL;
