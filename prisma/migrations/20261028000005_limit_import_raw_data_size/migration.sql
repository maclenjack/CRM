/*
  Fix: Add size limit to ImportRecord.rawData (10KB max)
  Adds a CHECK constraint to enforce maximum JSON size at database level
*/

-- Add CHECK constraint for rawData size (10KB = 10240 bytes)
-- Using pg_column_size for accurate byte measurement
-- PostgreSQL doesn't support IF NOT EXISTS for CHECK constraints, so we drop first if exists
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'import_records_raw_data_size_check' 
        AND table_name = 'import_records'
    ) THEN
        ALTER TABLE "import_records" DROP CONSTRAINT "import_records_raw_data_size_check";
    END IF;
END $$;

ALTER TABLE "import_records" 
ADD CONSTRAINT "import_records_raw_data_size_check" 
CHECK (pg_column_size("raw_data") <= 10240 OR "raw_data" IS NULL);

-- Comment for documentation
COMMENT ON CONSTRAINT "import_records_raw_data_size_check" ON "import_records" 
IS 'Ensures raw_data JSON does not exceed 10KB (10240 bytes)';