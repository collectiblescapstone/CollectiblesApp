-- CreateTable
CREATE TABLE "Card" (
    "id" TEXT NOT NULL,
    "localId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "set_name" TEXT NOT NULL,
    "series" TEXT NOT NULL,
    "image_url" TEXT NOT NULL,

    CONSTRAINT "Card_pkey" PRIMARY KEY ("id")
);
