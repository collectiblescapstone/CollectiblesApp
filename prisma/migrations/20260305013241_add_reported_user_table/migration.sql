-- CreateTable
CREATE TABLE "ReportedUser" (
    "id" TEXT NOT NULL,
    "reporterId" UUID NOT NULL,
    "reportedUserId" UUID NOT NULL,
    "isVerbalAbuse" BOOLEAN NOT NULL DEFAULT false,
    "isSpamming" BOOLEAN NOT NULL DEFAULT false,
    "isHarassment" BOOLEAN NOT NULL DEFAULT false,
    "isScamming" BOOLEAN NOT NULL DEFAULT false,
    "isBadName" BOOLEAN NOT NULL DEFAULT false,
    "isBadBio" BOOLEAN NOT NULL DEFAULT false,
    "reason" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReportedUser_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ReportedUser" ADD CONSTRAINT "ReportedUser_reporterId_fkey" FOREIGN KEY ("reporterId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReportedUser" ADD CONSTRAINT "ReportedUser_reportedUserId_fkey" FOREIGN KEY ("reportedUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
