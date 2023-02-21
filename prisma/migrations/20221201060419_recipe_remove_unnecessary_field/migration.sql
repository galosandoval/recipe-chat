/*
  Warnings:

  - You are about to drop the column `userId` on the `Recipe` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Recipe" DROP CONSTRAINT "Recipe_userId_fkey";

-- DropForeignKey
ALTER TABLE "RecipesOnList" DROP CONSTRAINT "RecipesOnList_listId_fkey";

-- AlterTable
ALTER TABLE "Recipe" DROP COLUMN "userId";

-- AlterTable
ALTER TABLE "RecipesOnList" ALTER COLUMN "listId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "RecipesOnList" ADD CONSTRAINT "RecipesOnList_listId_fkey" FOREIGN KEY ("listId") REFERENCES "List"("id") ON DELETE SET NULL ON UPDATE CASCADE;
