-- AlterTable
ALTER TABLE "CollectionEntry" ADD COLUMN     "forTrade" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "showcase" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Set" ALTER COLUMN "official" SET DEFAULT 0,
ALTER COLUMN "total" SET DEFAULT 0;