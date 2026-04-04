-- AlterTable
ALTER TABLE "Chat" ADD COLUMN "filterIds" TEXT[] DEFAULT ARRAY[]::TEXT[];
