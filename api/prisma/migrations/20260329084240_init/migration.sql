-- CreateTable
CREATE TABLE "FollowUpReminder" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "patientId" TEXT NOT NULL,
    "appointmentId" TEXT,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "dueDate" DATETIME NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "completedAt" DATETIME,
    "completedBy" TEXT,
    "assignedTo" TEXT,
    "priority" TEXT NOT NULL DEFAULT 'normal',
    "notifyClient" BOOLEAN NOT NULL DEFAULT false,
    "clientNotifiedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "FollowUpReminder_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "FollowUpReminder_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES "Appointment" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Task" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "type" TEXT NOT NULL DEFAULT 'general',
    "patientId" TEXT,
    "appointmentId" TEXT,
    "ownerId" TEXT,
    "assignedTo" TEXT,
    "dueDate" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "completedAt" DATETIME,
    "completedBy" TEXT,
    "priority" TEXT NOT NULL DEFAULT 'normal',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "passwordHash" TEXT,
    "ownerId" TEXT,
    CONSTRAINT "User_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "Owner" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_User" ("email", "id", "name", "passwordHash", "role") SELECT "email", "id", "name", "passwordHash", "role" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "User_ownerId_key" ON "User"("ownerId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "FollowUpReminder_patientId_idx" ON "FollowUpReminder"("patientId");

-- CreateIndex
CREATE INDEX "FollowUpReminder_status_idx" ON "FollowUpReminder"("status");

-- CreateIndex
CREATE INDEX "FollowUpReminder_dueDate_idx" ON "FollowUpReminder"("dueDate");

-- CreateIndex
CREATE INDEX "FollowUpReminder_assignedTo_idx" ON "FollowUpReminder"("assignedTo");

-- CreateIndex
CREATE INDEX "FollowUpReminder_priority_idx" ON "FollowUpReminder"("priority");

-- CreateIndex
CREATE INDEX "Task_status_idx" ON "Task"("status");

-- CreateIndex
CREATE INDEX "Task_assignedTo_idx" ON "Task"("assignedTo");

-- CreateIndex
CREATE INDEX "Task_dueDate_idx" ON "Task"("dueDate");

-- CreateIndex
CREATE INDEX "Task_priority_idx" ON "Task"("priority");
