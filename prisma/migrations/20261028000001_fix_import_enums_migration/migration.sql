/*
  Fix: Safe migration of import_records and import_sessions columns to enums
  This migration preserves existing data by:
  1. Adding new enum columns with temporary names
  2. Migrating data using CASE statements mapping old string values to enum values
  3. Dropping old columns
  4. Renaming new columns to final names
  5. Adding NOT NULL constraints
*/

-- CreateEnum (if not already created)
DO $$ BEGIN
    CREATE TYPE "ImportSource" AS ENUM ('PIPEDRIVE', 'HUBSPOT', 'CSV');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE "ImportSessionStatus" AS ENUM ('PENDING', 'RUNNING', 'COMPLETED', 'FAILED', 'ROLLED_BACK');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE "ImportRecordStatus" AS ENUM ('CREATED', 'UPDATED', 'SKIPPED', 'FAILED');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE "ImportEntityType" AS ENUM ('PERSON', 'ORGANIZATION', 'DEAL', 'ACTIVITY');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ============================================================================
-- import_records: entity_type migration
-- ============================================================================
ALTER TABLE "import_records" ADD COLUMN "entity_type_new" "ImportEntityType";

UPDATE "import_records" SET "entity_type_new" = CASE 
    WHEN "entity_type" = 'PERSON' THEN 'PERSON'::"ImportEntityType"
    WHEN "entity_type" = 'ORGANIZATION' THEN 'ORGANIZATION'::"ImportEntityType"
    WHEN "entity_type" = 'DEAL' THEN 'DEAL'::"ImportEntityType"
    WHEN "entity_type" = 'ACTIVITY' THEN 'ACTIVITY'::"ImportEntityType"
    ELSE 'PERSON'::"ImportEntityType"  -- fallback, should not happen
END;

ALTER TABLE "import_records" DROP COLUMN "entity_type";
ALTER TABLE "import_records" RENAME COLUMN "entity_type_new" TO "entity_type";
ALTER TABLE "import_records" ALTER COLUMN "entity_type" SET NOT NULL;

-- ============================================================================
-- import_records: status migration
-- ============================================================================
ALTER TABLE "import_records" ADD COLUMN "status_new" "ImportRecordStatus";

UPDATE "import_records" SET "status_new" = CASE 
    WHEN "status" = 'CREATED' THEN 'CREATED'::"ImportRecordStatus"
    WHEN "status" = 'UPDATED' THEN 'UPDATED'::"ImportRecordStatus"
    WHEN "status" = 'SKIPPED' THEN 'SKIPPED'::"ImportRecordStatus"
    WHEN "status" = 'FAILED' THEN 'FAILED'::"ImportRecordStatus"
    ELSE 'CREATED'::"ImportRecordStatus"  -- fallback
END;

ALTER TABLE "import_records" DROP COLUMN "status";
ALTER TABLE "import_records" RENAME COLUMN "status_new" TO "status";
ALTER TABLE "import_records" ALTER COLUMN "status" SET NOT NULL;

-- ============================================================================
-- import_sessions: source migration
-- ============================================================================
ALTER TABLE "import_sessions" ADD COLUMN "source_new" "ImportSource";

UPDATE "import_sessions" SET "source_new" = CASE 
    WHEN "source" = 'PIPEDRIVE' THEN 'PIPEDRIVE'::"ImportSource"
    WHEN "source" = 'HUBSPOT' THEN 'HUBSPOT'::"ImportSource"
    WHEN "source" = 'CSV' THEN 'CSV'::"ImportSource"
    ELSE 'CSV'::"ImportSource"  -- fallback
END;

ALTER TABLE "import_sessions" DROP COLUMN "source";
ALTER TABLE "import_sessions" RENAME COLUMN "source_new" TO "source";
ALTER TABLE "import_sessions" ALTER COLUMN "source" SET NOT NULL;

-- ============================================================================
-- import_sessions: status migration
-- ============================================================================
ALTER TABLE "import_sessions" ADD COLUMN "status_new" "ImportSessionStatus";

UPDATE "import_sessions" SET "status_new" = CASE 
    WHEN "status" = 'PENDING' THEN 'PENDING'::"ImportSessionStatus"
    WHEN "status" = 'RUNNING' THEN 'RUNNING'::"ImportSessionStatus"
    WHEN "status" = 'COMPLETED' THEN 'COMPLETED'::"ImportSessionStatus"
    WHEN "status" = 'FAILED' THEN 'FAILED'::"ImportSessionStatus"
    WHEN "status" = 'ROLLED_BACK' THEN 'ROLLED_BACK'::"ImportSessionStatus"
    ELSE 'PENDING'::"ImportSessionStatus"  -- fallback
END;

ALTER TABLE "import_sessions" DROP COLUMN "status";
ALTER TABLE "import_sessions" RENAME COLUMN "status_new" TO "status";
ALTER TABLE "import_sessions" ALTER COLUMN "status" SET NOT NULL;
ALTER TABLE "import_sessions" ALTER COLUMN "status" SET DEFAULT 'PENDING';

-- ============================================================================
-- Recreate indexes (they were dropped with columns)
-- ============================================================================
CREATE INDEX "import_records_entity_type_entity_id_idx" ON "import_records"("entity_type", "entity_id");
CREATE UNIQUE INDEX "import_records_session_id_entity_type_external_id_key" ON "import_records"("session_id", "entity_type", "external_id");
CREATE INDEX "import_sessions_source_idx" ON "import_sessions"("source");
CREATE INDEX "import_sessions_status_idx" ON "import_sessions"("status");