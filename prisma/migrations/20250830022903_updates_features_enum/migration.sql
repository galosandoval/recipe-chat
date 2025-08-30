/*
  Warnings:

  - The values [filters] on the enum `Feature` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "Feature_new" AS ENUM ('generateChat', 'recentRecipes', 'chat', 'chatFilters', 'lists', 'savedRecipes');
ALTER TABLE "User" ALTER COLUMN "onboarding" DROP DEFAULT;
ALTER TABLE "User" ALTER COLUMN "onboarding" TYPE "Feature_new"[] USING ("onboarding"::text::"Feature_new"[]);
ALTER TYPE "Feature" RENAME TO "Feature_old";
ALTER TYPE "Feature_new" RENAME TO "Feature";
DROP TYPE "Feature_old";
ALTER TABLE "User" ALTER COLUMN "onboarding" SET DEFAULT ARRAY[]::"Feature"[];
COMMIT;
