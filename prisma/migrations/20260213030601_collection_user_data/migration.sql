-- DropIndex
DROP INDEX "CollectionEntry_cardId_idx";

-- DropIndex
DROP INDEX "CollectionEntry_userId_idx";

-- CreateIndex
CREATE INDEX "CollectionEntry_userId_cardId_idx" ON "CollectionEntry"("userId", "cardId");

-- CreateIndex
CREATE INDEX "WishlistEntry_userId_cardId_idx" ON "WishlistEntry"("userId", "cardId");
