/*
  Warnings:

  - You are about to drop the column `listId` on the `RecipesOnList` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[userId]` on the table `List` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `userId` to the `List` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "RecipesOnList" DROP CONSTRAINT "RecipesOnList_listId_fkey";

-- DropIndex
DROP INDEX "RecipesOnList_listId_key";

-- AlterTable
ALTER TABLE "Ingredient" ADD COLUMN     "listId" INTEGER;

-- AlterTable
ALTER TABLE "List" ADD COLUMN     "userId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "RecipesOnList" DROP COLUMN "listId";

-- CreateIndex
CREATE UNIQUE INDEX "List_userId_key" ON "List"("userId");

-- AddForeignKey
ALTER TABLE "Ingredient" ADD CONSTRAINT "Ingredient_listId_fkey" FOREIGN KEY ("listId") REFERENCES "List"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "List" ADD CONSTRAINT "List_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
