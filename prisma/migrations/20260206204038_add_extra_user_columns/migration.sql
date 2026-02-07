-- AlterTable
ALTER TABLE "User" ADD COLUMN     "profile_pic" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "visibility" TEXT NOT NULL DEFAULT 'public';
