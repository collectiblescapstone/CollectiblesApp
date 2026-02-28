-- DropIndex
DROP INDEX "CollectionEntry_userId_cardId_idx";

-- DropIndex
DROP INDEX "WishlistEntry_userId_cardId_idx";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "latitude" DOUBLE PRECISION,
ADD COLUMN     "longitude" DOUBLE PRECISION;

-- CreateIndex
CREATE INDEX "CollectionEntry_cardId_idx" ON "CollectionEntry"("cardId");

-- CreateIndex
CREATE INDEX "CollectionEntry_userId_idx" ON "CollectionEntry"("userId");
