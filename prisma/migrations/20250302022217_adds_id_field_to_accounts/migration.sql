-- AlterTable
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_pkey" PRIMARY KEY ("provider", "providerAccountId");

-- DropIndex
DROP INDEX "accounts_provider_providerAccountId_key";
