-- AlterTable
ALTER TABLE "import_sessions" ADD COLUMN     "current_entity_processed" INTEGER,
ADD COLUMN     "current_entity_total" INTEGER,
ADD COLUMN     "current_entity_type" TEXT,
ADD COLUMN     "current_phase" TEXT,
ADD COLUMN     "processed_records" INTEGER,
ADD COLUMN     "total_records" INTEGER;
