/*
  Fix: Safe Float → Decimal conversion for Deal values
  Direct cast can lose precision; use ROUND to 2 decimal places first
*/

-- Check current column type and convert safely
DO $$ 
BEGIN
    -- Check if value column is DOUBLE PRECISION (float)
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'deals' AND column_name = 'value' AND data_type = 'double precision'
    ) THEN
        -- Convert with rounding to 2 decimal places to avoid precision loss
        ALTER TABLE "deals" ALTER COLUMN "value" TYPE DECIMAL(12,2) 
        USING ROUND("value"::numeric, 2);
    END IF;
END $$;

-- Ensure default is set correctly
ALTER TABLE "deals" ALTER COLUMN "value" SET DEFAULT 0;