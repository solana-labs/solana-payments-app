-- CreateTable
CREATE TABLE `Merchant` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `userPublicKey` VARCHAR(191) NOT NULL,
    `paymentPublicKey` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `Merchant_userPublicKey_key`(`userPublicKey`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ShopifyAccess` (
    `shop` VARCHAR(191) NOT NULL,
    `accessToken` VARCHAR(191) NOT NULL,
    `lastNonce` VARCHAR(191) NOT NULL,
    `scope` VARCHAR(191) NOT NULL,
    `merchantId` INTEGER NOT NULL,

    UNIQUE INDEX `ShopifyAccess_shop_key`(`shop`),
    UNIQUE INDEX `ShopifyAccess_merchantId_key`(`merchantId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `ShopifyAccess` ADD CONSTRAINT `ShopifyAccess_merchantId_fkey` FOREIGN KEY (`merchantId`) REFERENCES `Merchant`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
