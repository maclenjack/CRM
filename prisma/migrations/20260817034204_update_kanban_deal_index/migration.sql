-- DropIndex
DROP INDEX "deals_owner_id_stage_idx";

-- CreateIndex
CREATE INDEX "deals_owner_id_stage_position_idx" ON "deals"("owner_id", "stage", "position");
