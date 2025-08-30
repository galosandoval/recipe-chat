-- CreateTable
CREATE TABLE "FiltersOnChats" (
    "filterId" TEXT NOT NULL,
    "chatId" TEXT NOT NULL,

    CONSTRAINT "FiltersOnChats_pkey" PRIMARY KEY ("filterId","chatId")
);

-- AddForeignKey
ALTER TABLE "FiltersOnChats" ADD CONSTRAINT "FiltersOnChats_filterId_fkey" FOREIGN KEY ("filterId") REFERENCES "Filter"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FiltersOnChats" ADD CONSTRAINT "FiltersOnChats_chatId_fkey" FOREIGN KEY ("chatId") REFERENCES "Chat"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
