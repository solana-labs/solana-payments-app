-- AlterTable
ALTER TABLE `PaymentRecord` ADD COLUMN `rejectionReason` ENUM('dependencySafetyReason', 'customerSafetyReason', 'internalServerReason', 'unknownReason') NULL;
