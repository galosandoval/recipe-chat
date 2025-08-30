-- CreateEnum
CREATE TYPE "Feature" AS ENUM ('recipes', 'chat', 'filters', 'lists', 'savedRecipes', 'advanced_search', 'meal_planning', 'shopping_lists');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "onboarding" "Feature"[];
