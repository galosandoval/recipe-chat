-- Backfill any NULL raw_string from name (safety for rows missed in expand phase)
UPDATE "Ingredient" SET "raw_string" = "name" WHERE "raw_string" IS NULL;

-- Make raw_string required
ALTER TABLE "Ingredient" ALTER COLUMN "raw_string" SET NOT NULL;

-- Drop legacy name column
ALTER TABLE "Ingredient" DROP COLUMN "name";

-- Rename ingredient columns to camelCase to match rest of schema
ALTER TABLE "Ingredient" RENAME COLUMN "raw_string" TO "rawString";
ALTER TABLE "Ingredient" RENAME COLUMN "unit_type" TO "unitType";
ALTER TABLE "Ingredient" RENAME COLUMN "item_name" TO "itemName";
