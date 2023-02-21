/*
  Warnings:

  - Made the column `description` on table `Instruction` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Instruction" ALTER COLUMN "description" SET NOT NULL;
