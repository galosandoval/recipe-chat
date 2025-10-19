-- AlterTable
-- Add slug column as NOT NULL with a database-level default using gen_random_uuid()
-- This allows existing rows to get automatic values
ALTER TABLE "Recipe" ADD COLUMN "slug" TEXT NOT NULL DEFAULT gen_random_uuid()::text;

-- CreateIndex
CREATE UNIQUE INDEX "Recipe_slug_key" ON "Recipe"("slug");

-- CreateIndex
CREATE INDEX "Recipe_userId_slug_idx" ON "Recipe"("userId", "slug");

