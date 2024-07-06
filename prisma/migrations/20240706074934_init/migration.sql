-- CreateTable
CREATE TABLE `Referrals` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `ref_id` VARCHAR(191) NOT NULL,
    `email` VARCHAR(255) NOT NULL,
    `text` VARCHAR(255) NOT NULL,
    `ref_email` VARCHAR(255) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
