-- CreateTable
CREATE TABLE "Subset" (
    "id" TEXT NOT NULL,
    "setId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "prefix" TEXT NOT NULL,
    "official" INTEGER NOT NULL,

    CONSTRAINT "Subset_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Subset_setId_idx" ON "Subset"("setId");

-- AddForeignKey
ALTER TABLE "Subset" ADD CONSTRAINT "Subset_setId_fkey" FOREIGN KEY ("setId") REFERENCES "Set"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
