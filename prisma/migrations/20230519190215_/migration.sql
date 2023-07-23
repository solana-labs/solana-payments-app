/*
  Warnings:

  - A unique constraint covering the columns `[shopId]` on the table `PaymentRecord` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `PaymentRecord_shopId_key` ON `PaymentRecord`(`shopId`);

-- AddForeignKey
ALTER TABLE `RefundRecord` ADD CONSTRAINT `RefundRecord_shopPaymentId_fkey` FOREIGN KEY (`shopPaymentId`) REFERENCES `PaymentRecord`(`shopId`) ON DELETE RESTRICT ON UPDATE CASCADE;
