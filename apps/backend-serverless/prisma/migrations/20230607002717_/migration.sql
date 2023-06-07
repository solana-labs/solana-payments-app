
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
