/*
  Warnings:

  - Made the column `updatedAt` on table `RecipeVector` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "RecipeVector" DROP CONSTRAINT "RecipeVector_recipeId_fkey";

-- DropIndex
DROP INDEX "RecipeVector_embedding_hnsw";

-- AlterTable
ALTER TABLE "RecipeVector" ALTER COLUMN "updatedAt" SET NOT NULL,
ALTER COLUMN "updatedAt" DROP DEFAULT,
ALTER COLUMN "updatedAt" SET DATA TYPE TIMESTAMP(3);

-- AddForeignKey
ALTER TABLE "RecipeVector" ADD CONSTRAINT "RecipeVector_recipeId_fkey" FOREIGN KEY ("recipeId") REFERENCES "Recipe"("id") ON DELETE CASCADE ON UPDATE CASCADE;
