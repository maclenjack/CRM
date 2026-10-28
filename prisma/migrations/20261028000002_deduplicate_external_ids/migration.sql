/*
  Fix: Deduplicate external_id columns before adding unique constraints
  This migration handles existing duplicate non-NULL external_id values
  by keeping the first record (by created_at) and nullifying the rest.
*/

-- ============================================================================
-- Deduplicate activities.external_id
-- ============================================================================
WITH duplicates AS (
    SELECT id, external_id, 
           ROW_NUMBER() OVER (PARTITION BY external_id ORDER BY created_at) as rn
    FROM activities 
    WHERE external_id IS NOT NULL
)
UPDATE activities 
SET external_id = NULL 
WHERE id IN (SELECT id FROM duplicates WHERE rn > 1);

-- ============================================================================
-- Deduplicate deals.external_id
-- ============================================================================
WITH duplicates AS (
    SELECT id, external_id, 
           ROW_NUMBER() OVER (PARTITION BY external_id ORDER BY created_at) as rn
    FROM deals 
    WHERE external_id IS NOT NULL
)
UPDATE deals 
SET external_id = NULL 
WHERE id IN (SELECT id FROM duplicates WHERE rn > 1);

-- ============================================================================
-- Deduplicate organizations.external_id
-- ============================================================================
WITH duplicates AS (
    SELECT id, external_id, 
           ROW_NUMBER() OVER (PARTITION BY external_id ORDER BY created_at) as rn
    FROM organizations 
    WHERE external_id IS NOT NULL
)
UPDATE organizations 
SET external_id = NULL 
WHERE id IN (SELECT id FROM duplicates WHERE rn > 1);

-- ============================================================================
-- Deduplicate people.external_id
-- ============================================================================
WITH duplicates AS (
    SELECT id, external_id, 
           ROW_NUMBER() OVER (PARTITION BY external_id ORDER BY created_at) as rn
    FROM people 
    WHERE external_id IS NOT NULL
)
UPDATE people 
SET external_id = NULL 
WHERE id IN (SELECT id FROM duplicates WHERE rn > 1);

-- ============================================================================
-- Now add unique indexes (safe after deduplication)
-- Use IF NOT EXISTS to handle case where indexes already exist
-- ============================================================================
CREATE UNIQUE INDEX IF NOT EXISTS "activities_external_id_key" ON "activities"("external_id");
CREATE UNIQUE INDEX IF NOT EXISTS "deals_external_id_key" ON "deals"("external_id");
CREATE UNIQUE INDEX IF NOT EXISTS "organizations_external_id_key" ON "organizations"("external_id");
CREATE UNIQUE INDEX IF NOT EXISTS "people_external_id_key" ON "people"("external_id");