-- CreateTable
CREATE TABLE "RecipesOnMessages" (
    "recipeId" TEXT NOT NULL,
    "messageId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RecipesOnMessages_pkey" PRIMARY KEY ("recipeId","messageId")
);

-- AddForeignKey
ALTER TABLE "RecipesOnMessages" ADD CONSTRAINT "RecipesOnMessages_recipeId_fkey" FOREIGN KEY ("recipeId") REFERENCES "Recipe"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecipesOnMessages" ADD CONSTRAINT "RecipesOnMessages_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "Message"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
