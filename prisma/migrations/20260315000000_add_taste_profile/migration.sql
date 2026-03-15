-- CreateTable
CREATE TABLE "TasteProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "dietaryRestrictions" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "cuisinePreferences" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "cookingSkill" TEXT NOT NULL,
    "householdSize" INTEGER NOT NULL DEFAULT 2,
    "healthGoals" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TasteProfile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TasteProfile_userId_key" ON "TasteProfile"("userId");

-- AddForeignKey
ALTER TABLE "TasteProfile" ADD CONSTRAINT "TasteProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
