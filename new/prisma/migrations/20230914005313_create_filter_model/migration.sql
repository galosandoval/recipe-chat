/*
  Warnings:

  - A unique constraint covering the columns `[filterId]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "filterId" TEXT;

-- CreateTable
CREATE TABLE "Filter" (
    "id" TEXT NOT NULL,
    "words" TEXT[],
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Filter_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Filter_userId_key" ON "Filter"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "User_filterId_key" ON "User"("filterId");

-- AddForeignKey
ALTER TABLE "Filter" ADD CONSTRAINT "Filter_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
