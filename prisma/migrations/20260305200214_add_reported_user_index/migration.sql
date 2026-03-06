-- CreateIndex
CREATE INDEX "ReportedUser_reporterId_reportedUserId_createdAt_idx" ON "ReportedUser"("reporterId", "reportedUserId", "createdAt");
