-- DropIndex
DROP INDEX "RecipeVector_embedding_hnsw";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "lastStripeEventId" TEXT;
