-- Enable pgvector once (safe to run repeatedly)
CREATE EXTENSION IF NOT EXISTS vector;

-- Add new optional columns to Recipe (non-breaking; existing data remains)
ALTER TABLE "Recipe"
  ADD COLUMN IF NOT EXISTS "nameNorm"         TEXT,
  ADD COLUMN IF NOT EXISTS "cuisine"          TEXT,
  ADD COLUMN IF NOT EXISTS "course"           TEXT,
  ADD COLUMN IF NOT EXISTS "dietTags"         TEXT[] DEFAULT '{}'::text[],
  ADD COLUMN IF NOT EXISTS "flavorTags"       TEXT[] DEFAULT '{}'::text[],
  ADD COLUMN IF NOT EXISTS "mainIngredients"  TEXT[] DEFAULT '{}'::text[],
  ADD COLUMN IF NOT EXISTS "techniques"       TEXT[] DEFAULT '{}'::text[],
  ADD COLUMN IF NOT EXISTS "prepMinutes"      INTEGER,
  ADD COLUMN IF NOT EXISTS "cookMinutes"      INTEGER;

-- Backfill nameNorm (idempotent)
UPDATE "Recipe"
SET "nameNorm" = regexp_replace(lower("name"), '[^a-z0-9]+', ' ', 'g')
WHERE "nameNorm" IS NULL;

-- Helpful indexes
CREATE INDEX IF NOT EXISTS "Recipe_userId_nameNorm_idx" ON "Recipe" ("userId", "nameNorm");
CREATE INDEX IF NOT EXISTS "Recipe_userId_cuisine_idx"  ON "Recipe" ("userId", "cuisine");
CREATE INDEX IF NOT EXISTS "Recipe_userId_course_idx"   ON "Recipe" ("userId", "course");

-- Vector side table (1–1 with Recipe)
CREATE TABLE IF NOT EXISTS "RecipeVector" (
  "recipeId"  TEXT PRIMARY KEY REFERENCES "Recipe"("id") ON DELETE CASCADE,
  "userId"    TEXT NOT NULL,
  "signature" TEXT NOT NULL,
  "embedding" VECTOR(1536) NOT NULL,
  "updatedAt" TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "RecipeVector_userId_idx" ON "RecipeVector" ("userId");

-- ANN index: prefer HNSW if available; otherwise IVFFlat
DO $$
BEGIN
  BEGIN
    CREATE INDEX "RecipeVector_embedding_hnsw"
      ON "RecipeVector" USING hnsw ("embedding" vector_cosine_ops);
  EXCEPTION
    WHEN undefined_object THEN
      CREATE INDEX "RecipeVector_embedding_ivfflat"
        ON "RecipeVector" USING ivfflat ("embedding" vector_cosine_ops) WITH (lists = 100);
  END;
END$$;