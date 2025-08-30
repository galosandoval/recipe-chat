/*
  Warnings:

  - You are about to drop the `FiltersOnChats` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "FiltersOnChats" DROP CONSTRAINT "FiltersOnChats_chatId_fkey";

-- DropForeignKey
ALTER TABLE "FiltersOnChats" DROP CONSTRAINT "FiltersOnChats_filterId_fkey";

-- DropTable
DROP TABLE "FiltersOnChats";
