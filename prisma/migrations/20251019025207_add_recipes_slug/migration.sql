-- Migration applied directly to production. Recreated locally to sync migration history.
-- AlterTable
ALTER TABLE "Recipe" ADD COLUMN IF NOT EXISTS "slug" TEXT NOT NULL DEFAULT gen_random_uuid()::text;

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "Recipe_slug_key" ON "Recipe"("slug");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Recipe_userId_slug_idx" ON "Recipe"("userId", "slug");
