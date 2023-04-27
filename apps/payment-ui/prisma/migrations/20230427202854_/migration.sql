/*
  Warnings:

  - You are about to drop the `ShopifyAccess` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE `ShopifyAccess`;

-- CreateTable
CREATE TABLE `Merchant` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `shop` VARCHAR(191) NOT NULL,
    `accessToken` VARCHAR(191) NULL,
    `scopes` VARCHAR(191) NULL,
    `lastNonce` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `Merchant_shop_key`(`shop`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
