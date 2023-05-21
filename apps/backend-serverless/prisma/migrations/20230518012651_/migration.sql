-- AlterTable
ALTER TABLE `Merchant` ADD COLUMN `acceptedTermsAndConditions` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `dismissCompleted` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `name` VARCHAR(191) NULL;
