/*
  Warnings:

  - You are about to drop the column `recipeId` on the `messages` table. All the data in the column will be lost.

*/
-- First, add the new columns
ALTER TABLE "recipes" ADD COLUMN "messageId" TEXT;
ALTER TABLE "recipes" ADD COLUMN "saved" BOOLEAN NOT NULL DEFAULT false;

-- Copy existing relationships from messages to recipes
UPDATE "recipes" r
SET "messageId" = m.id
FROM "messages" m
WHERE m."recipeId" = r.id;

-- Add the foreign key constraint
ALTER TABLE "recipes" ADD CONSTRAINT "recipes_messageId_fkey" 
FOREIGN KEY ("messageId") REFERENCES "messages"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Now safely drop the old columns
ALTER TABLE "messages" DROP CONSTRAINT "messages_recipeId_fkey";
DROP INDEX "messages_recipeId_key";
ALTER TABLE "messages" DROP COLUMN "recipeId";
