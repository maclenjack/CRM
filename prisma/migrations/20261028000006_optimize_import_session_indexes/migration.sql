/*
  Optimization: Add composite index for ImportSession queries
  Common query pattern: filter by createdById AND status
*/

CREATE INDEX IF NOT EXISTS "import_sessions_created_by_id_status_idx" ON "import_sessions"("created_by_id", "status");