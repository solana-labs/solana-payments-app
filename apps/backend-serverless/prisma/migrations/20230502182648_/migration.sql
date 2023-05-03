/*
  Warnings:

  - Added the required column `cancelURL` to the `PaymentRecord` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `PaymentRecord` ADD COLUMN `cancelURL` VARCHAR(191) NOT NULL,
    ADD COLUMN `redirectUrl` VARCHAR(191) NULL;
