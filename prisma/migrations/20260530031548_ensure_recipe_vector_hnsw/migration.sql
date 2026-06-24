-- Ensure the RecipeVector ANN index exists as HNSW (cosine).
-- The original add_recipes_vector migration's DO/EXCEPTION block silently
-- swallowed failures, leaving some environments with no ANN index at all.
DROP INDEX IF EXISTS "RecipeVector_embedding_ivfflat";
DROP INDEX IF EXISTS "RecipeVector_embedding_hnsw";

CREATE INDEX "RecipeVector_embedding_hnsw"
  ON "RecipeVector" USING hnsw ("embedding" vector_cosine_ops);
