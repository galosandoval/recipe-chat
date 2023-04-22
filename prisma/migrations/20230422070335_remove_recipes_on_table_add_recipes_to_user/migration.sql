/*
  Warnings:

  - You are about to drop the column `isChecked` on the `Ingredient` table. All the data in the column will be lost.
  - You are about to drop the column `completed` on the `List` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `List` table. All the data in the column will be lost.
  - You are about to drop the `RecipesOnList` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "RecipesOnList" DROP CONSTRAINT "RecipesOnList_recipeId_fkey";

-- DropForeignKey
ALTER TABLE "RecipesOnList" DROP CONSTRAINT "RecipesOnList_userId_fkey";

-- AlterTable
ALTER TABLE "Ingredient" DROP COLUMN "isChecked";

-- AlterTable
ALTER TABLE "List" DROP COLUMN "completed",
DROP COLUMN "name";

-- AlterTable
ALTER TABLE "Recipe" ADD COLUMN     "userId" INTEGER;

-- DropTable
DROP TABLE "RecipesOnList";

-- AddForeignKey
ALTER TABLE "Recipe" ADD CONSTRAINT "Recipe_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
