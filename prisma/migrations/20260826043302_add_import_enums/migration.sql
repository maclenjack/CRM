/*
  Warnings:

  - The `status` column on the `import_sessions` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Changed the type of `entity_type` on the `import_records` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `status` on the `import_records` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `source` on the `import_sessions` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "ImportSource" AS ENUM ('PIPEDRIVE', 'HUBSPOT', 'CSV');

-- CreateEnum
CREATE TYPE "ImportSessionStatus" AS ENUM ('PENDING', 'RUNNING', 'COMPLETED', 'FAILED', 'ROLLED_BACK');

-- CreateEnum
CREATE TYPE "ImportRecordStatus" AS ENUM ('CREATED', 'UPDATED', 'SKIPPED', 'FAILED');

-- CreateEnum
CREATE TYPE "ImportEntityType" AS ENUM ('PERSON', 'ORGANIZATION', 'DEAL', 'ACTIVITY');

-- AlterTable
ALTER TABLE "import_records" DROP COLUMN "entity_type",
ADD COLUMN     "entity_type" "ImportEntityType" NOT NULL,
DROP COLUMN "status",
ADD COLUMN     "status" "ImportRecordStatus" NOT NULL;

-- AlterTable
ALTER TABLE "import_sessions" DROP COLUMN "source",
ADD COLUMN     "source" "ImportSource" NOT NULL,
DROP COLUMN "status",
ADD COLUMN     "status" "ImportSessionStatus" NOT NULL DEFAULT 'PENDING';

-- CreateIndex
CREATE INDEX "import_records_entity_type_entity_id_idx" ON "import_records"("entity_type", "entity_id");

-- CreateIndex
CREATE UNIQUE INDEX "import_records_session_id_entity_type_external_id_key" ON "import_records"("session_id", "entity_type", "external_id");

-- CreateIndex
CREATE INDEX "import_sessions_source_idx" ON "import_sessions"("source");

-- CreateIndex
CREATE INDEX "import_sessions_status_idx" ON "import_sessions"("status");
