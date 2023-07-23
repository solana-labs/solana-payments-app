-- CreateTable
CREATE TABLE `PaymentRecord` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `status` VARCHAR(191) NOT NULL,
    `shopId` VARCHAR(191) NOT NULL,
    `shopGid` VARCHAR(191) NULL,
    `shopGroup` VARCHAR(191) NOT NULL,
    `test` BOOLEAN NOT NULL,
    `amount` DOUBLE NOT NULL,
    `currency` VARCHAR(191) NOT NULL,
    `merchantId` INTEGER NOT NULL,
    `customerAddress` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `TransactionRecord` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `signature` VARCHAR(191) NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `createdAt` VARCHAR(191) NOT NULL,
    `paymentRecordId` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `PaymentRecord` ADD CONSTRAINT `PaymentRecord_merchantId_fkey` FOREIGN KEY (`merchantId`) REFERENCES `Merchant`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TransactionRecord` ADD CONSTRAINT `TransactionRecord_paymentRecordId_fkey` FOREIGN KEY (`paymentRecordId`) REFERENCES `PaymentRecord`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
