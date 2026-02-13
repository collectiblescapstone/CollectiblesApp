/*
  Warnings:

  - You are about to drop the column `quantity` on the `CollectionEntry` table. All the data in the column will be lost.
  - Made the column `variant` on table `CollectionEntry` required. This step will fail if there are existing NULL values in that column.

*/
-- DropIndex
DROP INDEX "CollectionEntry_userId_cardId_condition_variant_key";

-- AlterTable
ALTER TABLE "CollectionEntry" DROP COLUMN "quantity",
ADD COLUMN     "grade" TEXT NOT NULL DEFAULT 'Ungraded',
ADD COLUMN     "gradeLevel" TEXT,
ADD COLUMN     "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
ALTER COLUMN "variant" SET NOT NULL,
ALTER COLUMN "variant" SET DEFAULT 'normal';

-- CreateIndex
CREATE INDEX "CollectionEntry_userId_idx" ON "CollectionEntry"("userId");

-- CreateIndex
CREATE INDEX "CollectionEntry_cardId_idx" ON "CollectionEntry"("cardId");
