/*
  Warnings:

  - You are about to drop the `ListRecipes` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[username]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "ListRecipes" DROP CONSTRAINT "ListRecipes_listId_fkey";

-- DropForeignKey
ALTER TABLE "ListRecipes" DROP CONSTRAINT "ListRecipes_recipeId_fkey";

-- DropForeignKey
ALTER TABLE "ListRecipes" DROP CONSTRAINT "ListRecipes_userId_fkey";

-- DropTable
DROP TABLE "ListRecipes";

-- CreateTable
CREATE TABLE "RecipesOnList" (
    "id" SERIAL NOT NULL,
    "recipeId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "listId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RecipesOnList_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "RecipesOnList_recipeId_key" ON "RecipesOnList"("recipeId");

-- CreateIndex
CREATE UNIQUE INDEX "RecipesOnList_userId_key" ON "RecipesOnList"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "RecipesOnList_listId_key" ON "RecipesOnList"("listId");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- AddForeignKey
ALTER TABLE "RecipesOnList" ADD CONSTRAINT "RecipesOnList_recipeId_fkey" FOREIGN KEY ("recipeId") REFERENCES "Recipe"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecipesOnList" ADD CONSTRAINT "RecipesOnList_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecipesOnList" ADD CONSTRAINT "RecipesOnList_listId_fkey" FOREIGN KEY ("listId") REFERENCES "List"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
