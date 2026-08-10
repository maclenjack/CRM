-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'MANAGER', 'USER');

-- DropIndex
DROP INDEX IF EXISTS "activities_createdAt_idx";
DROP INDEX IF EXISTS "activities_deletedAt_idx";
DROP INDEX IF EXISTS "activities_done_idx";
DROP INDEX IF EXISTS "activities_endDate_idx";
DROP INDEX IF EXISTS "activities_startDate_idx";
DROP INDEX IF EXISTS "activities_updatedAt_idx";
DROP INDEX IF EXISTS "deals_createdAt_idx";
DROP INDEX IF EXISTS "deals_deletedAt_idx";
DROP INDEX IF EXISTS "deals_expectedCloseDate_idx";
DROP INDEX IF EXISTS "deals_lostAt_idx";
DROP INDEX IF EXISTS "deals_updatedAt_idx";
DROP INDEX IF EXISTS "deals_wonAt_idx";
DROP INDEX IF EXISTS "labels_createdAt_idx";
DROP INDEX IF EXISTS "organizations_createdAt_idx";
DROP INDEX IF EXISTS "organizations_deletedAt_idx";
DROP INDEX IF EXISTS "people_createdAt_idx";
DROP INDEX IF EXISTS "people_deletedAt_idx";

-- AlterTable: Activities
ALTER TABLE "activities" RENAME COLUMN "createdAt" TO "created_at";
ALTER TABLE "activities" RENAME COLUMN "deletedAt" TO "deleted_at";
ALTER TABLE "activities" RENAME COLUMN "done" TO "is_done";
ALTER TABLE "activities" RENAME COLUMN "endDate" TO "end_date";
ALTER TABLE "activities" RENAME COLUMN "startDate" TO "start_date";
ALTER TABLE "activities" RENAME COLUMN "updatedAt" TO "updated_at";

ALTER TABLE "activities" ALTER COLUMN "created_at" SET DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "activities" ALTER COLUMN "is_done" SET DEFAULT false;

-- AlterTable: Deals
ALTER TABLE "deals" RENAME COLUMN "createdAt" TO "created_at";
ALTER TABLE "deals" RENAME COLUMN "deletedAt" TO "deleted_at";
ALTER TABLE "deals" RENAME COLUMN "expectedCloseDate" TO "expected_close_date";
ALTER TABLE "deals" RENAME COLUMN "lastActivityDate" TO "last_activity_date";
ALTER TABLE "deals" RENAME COLUMN "lostAt" TO "lost_at";
ALTER TABLE "deals" RENAME COLUMN "lostReason" TO "lost_reason";
ALTER TABLE "deals" RENAME COLUMN "nextActivityDate" TO "next_activity_date";
ALTER TABLE "deals" RENAME COLUMN "updatedAt" TO "updated_at";
ALTER TABLE "deals" RENAME COLUMN "wonAt" TO "won_at";

ALTER TABLE "deals" ALTER COLUMN "created_at" SET DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "deals" ALTER COLUMN "value" SET DATA TYPE DECIMAL(12,2) USING "value"::numeric(12,2);

-- AlterTable: Labels
ALTER TABLE "labels" RENAME COLUMN "createdAt" TO "created_at";
ALTER TABLE "labels" RENAME COLUMN "updatedAt" TO "updated_at";
ALTER TABLE "labels" ALTER COLUMN "created_at" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable: Notes
ALTER TABLE "notes" RENAME COLUMN "createdAt" TO "created_at";
ALTER TABLE "notes" RENAME COLUMN "updatedAt" TO "updated_at";
ALTER TABLE "notes" ALTER COLUMN "created_at" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable: Organizations
ALTER TABLE "organizations" RENAME COLUMN "createdAt" TO "created_at";
ALTER TABLE "organizations" RENAME COLUMN "deletedAt" TO "deleted_at";
ALTER TABLE "organizations" RENAME COLUMN "updatedAt" TO "updated_at";
ALTER TABLE "organizations" ALTER COLUMN "created_at" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable: People
ALTER TABLE "people" RENAME COLUMN "createdAt" TO "created_at";
ALTER TABLE "people" RENAME COLUMN "deletedAt" TO "deleted_at";
ALTER TABLE "people" RENAME COLUMN "updatedAt" TO "updated_at";
ALTER TABLE "people" ALTER COLUMN "created_at" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable: Person Emails & Phones
ALTER TABLE "person_emails" ADD COLUMN IF NOT EXISTS "is_primary" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "person_phones" ADD COLUMN IF NOT EXISTS "is_primary" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable: Users (Safely cast string role to Role enum)
ALTER TABLE "users" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "users" ALTER COLUMN "role" TYPE "Role" USING UPPER("role")::"Role";
ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'USER';

-- CreateIndex
CREATE INDEX "activities_start_date_idx" ON "activities"("start_date");
CREATE INDEX "activities_end_date_idx" ON "activities"("end_date");
CREATE INDEX "activities_is_done_idx" ON "activities"("is_done");
CREATE INDEX "activities_created_at_idx" ON "activities"("created_at");
CREATE INDEX "activities_updated_at_idx" ON "activities"("updated_at");
CREATE INDEX "activities_deleted_at_idx" ON "activities"("deleted_at");
CREATE INDEX "activities_owner_id_is_done_idx" ON "activities"("owner_id", "is_done");

-- CreateIndex
CREATE INDEX "deals_won_at_idx" ON "deals"("won_at");
CREATE INDEX "deals_lost_at_idx" ON "deals"("lost_at");
CREATE INDEX "deals_expected_close_date_idx" ON "deals"("expected_close_date");
CREATE INDEX "deals_created_at_idx" ON "deals"("created_at");
CREATE INDEX "deals_updated_at_idx" ON "deals"("updated_at");
CREATE INDEX "deals_deleted_at_idx" ON "deals"("deleted_at");
CREATE INDEX "deals_organization_id_status_idx" ON "deals"("organization_id", "status");
CREATE INDEX "deals_owner_id_stage_idx" ON "deals"("owner_id", "stage");

-- CreateIndex
CREATE INDEX "labels_created_at_idx" ON "labels"("created_at");

-- CreateIndex
CREATE INDEX "organizations_created_at_idx" ON "organizations"("created_at");
CREATE INDEX "organizations_deleted_at_idx" ON "organizations"("deleted_at");

-- CreateIndex
CREATE INDEX "people_created_at_idx" ON "people"("created_at");
CREATE INDEX "people_deleted_at_idx" ON "people"("deleted_at");
