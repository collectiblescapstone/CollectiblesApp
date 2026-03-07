/*
  Warnings:

  - Made the column `username` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- Ensure that username is not null before applying the NOT NULL constraint
UPDATE public."User"
SET username = 'user_' || right("id"::text, 8)
WHERE username IS NULL;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "username" SET NOT NULL;
