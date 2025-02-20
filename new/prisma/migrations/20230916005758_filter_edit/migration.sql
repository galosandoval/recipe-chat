/*
  Warnings:

  - You are about to drop the column `words` on the `Filter` table. All the data in the column will be lost.
  - You are about to drop the column `filterId` on the `User` table. All the data in the column will be lost.
  - Added the required column `name` to the `Filter` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "User_filterId_key";

-- AlterTable
ALTER TABLE "Filter" DROP COLUMN "words",
ADD COLUMN     "checked" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "name" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "filterId";
