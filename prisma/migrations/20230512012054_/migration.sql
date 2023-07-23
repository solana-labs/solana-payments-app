/*
  Warnings:

  - Added the required column `usdcAmount` to the `PaymentRecord` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `PaymentRecord` ADD COLUMN `usdcAmount` DOUBLE NOT NULL;
