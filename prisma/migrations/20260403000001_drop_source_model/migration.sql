-- DropForeignKey
ALTER TABLE "Source" DROP CONSTRAINT IF EXISTS "Source_recipeId_fkey";

-- DropTable
DROP TABLE IF EXISTS "Source";
