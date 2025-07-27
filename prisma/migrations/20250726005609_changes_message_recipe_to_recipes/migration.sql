/*
  Warnings:

  - You are about to drop the column `recipeId` on the `Message` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Message" DROP CONSTRAINT "Message_recipeId_fkey";

-- DropIndex
DROP INDEX "Message_recipeId_key";

-- AlterTable
ALTER TABLE "Recipe" ADD COLUMN     "messageId" TEXT,
ADD COLUMN     "saved" BOOLEAN;

-- Copy existing recipeId relationships to the new messageId field
-- This preserves the one-to-one relationships that existed before
UPDATE "Recipe"
SET "messageId" = "Message"."id"
FROM "Message"
WHERE "Message"."recipeId" = "Recipe"."id"
AND "Message"."recipeId" IS NOT NULL;

-- AddForeignKey
ALTER TABLE "Recipe" ADD CONSTRAINT "Recipe_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "Message"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Now safely drop the old recipeId column since we've preserved the relationships
ALTER TABLE "Message" DROP COLUMN "recipeId";
