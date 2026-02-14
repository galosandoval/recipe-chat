-- CreateEnum
CREATE TYPE "IngredientUnitType" AS ENUM ('volume', 'weight', 'count');

-- AlterTable
ALTER TABLE "Ingredient" ADD COLUMN     "quantity" DOUBLE PRECISION,
ADD COLUMN     "unit" TEXT,
ADD COLUMN     "unit_type" "IngredientUnitType",
ADD COLUMN     "item_name" TEXT,
ADD COLUMN     "preparation" TEXT,
ADD COLUMN     "raw_string" TEXT;
