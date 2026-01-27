/*
  Warnings:

  - You are about to drop the column `x` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "x",
ADD COLUMN     "twitter" TEXT;
