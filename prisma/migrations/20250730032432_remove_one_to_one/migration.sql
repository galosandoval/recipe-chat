/*
  Warnings:

  - The values [function,tool] on the enum `Role` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `recipeId` on the `Message` table. All the data in the column will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "Role_new" AS ENUM ('system', 'user', 'assistant', 'data');
ALTER TABLE "Message" ALTER COLUMN "role" TYPE "Role_new" USING ("role"::text::"Role_new");
ALTER TYPE "Role" RENAME TO "Role_old";
ALTER TYPE "Role_new" RENAME TO "Role";
DROP TYPE "Role_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "Message" DROP CONSTRAINT "Message_recipeId_fkey";

-- DropIndex
DROP INDEX "Message_recipeId_key";

-- AlterTable
ALTER TABLE "Message" DROP COLUMN "recipeId";
