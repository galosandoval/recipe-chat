-- DropForeignKey
ALTER TABLE "public"."Message" DROP CONSTRAINT "Message_chatId_fkey";

-- DropForeignKey
ALTER TABLE "public"."RecipesOnMessages" DROP CONSTRAINT "RecipesOnMessages_messageId_fkey";

-- AlterTable
ALTER TABLE "Chat" ADD COLUMN     "page" TEXT NOT NULL DEFAULT 'recipes',
ADD COLUMN     "recipeId" TEXT;

-- CreateIndex
CREATE INDEX "Chat_userId_page_recipeId_idx" ON "Chat"("userId", "page", "recipeId");

-- AddForeignKey
ALTER TABLE "Chat" ADD CONSTRAINT "Chat_recipeId_fkey" FOREIGN KEY ("recipeId") REFERENCES "Recipe"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_chatId_fkey" FOREIGN KEY ("chatId") REFERENCES "Chat"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecipesOnMessages" ADD CONSTRAINT "RecipesOnMessages_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "Message"("id") ON DELETE CASCADE ON UPDATE CASCADE;
