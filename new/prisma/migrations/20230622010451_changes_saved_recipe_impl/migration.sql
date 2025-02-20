/*
  Warnings:

  - You are about to drop the column `isSaved` on the `Message` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[recipeId]` on the table `Message` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Message" DROP COLUMN "isSaved",
ADD COLUMN     "recipeId" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "Message_recipeId_key" ON "Message"("recipeId");

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_recipeId_fkey" FOREIGN KEY ("recipeId") REFERENCES "Recipe"("id") ON DELETE SET NULL ON UPDATE CASCADE;
