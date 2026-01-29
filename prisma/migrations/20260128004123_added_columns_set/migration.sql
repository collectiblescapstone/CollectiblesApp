/*
  Warnings:

  - Added the required column `official` to the `Set` table without a default value. This is not possible if the table is not empty.
  - Added the required column `total` to the `Set` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Set" ADD COLUMN     "logo" TEXT,
ADD COLUMN     "official" INTEGER NOT NULL,
ADD COLUMN     "symbol" TEXT,
ADD COLUMN     "total" INTEGER NOT NULL;
