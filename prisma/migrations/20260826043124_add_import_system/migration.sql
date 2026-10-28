-- CreateTable
CREATE TABLE "import_sessions" (
    "id" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "file_name" TEXT,
    "file_size" INTEGER,
    "row_count" INTEGER,
    "error_count" INTEGER NOT NULL DEFAULT 0,
    "created_by_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" TIMESTAMP(3),

    CONSTRAINT "import_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "import_records" (
    "id" TEXT NOT NULL,
    "session_id" TEXT NOT NULL,
    "entity_type" TEXT NOT NULL,
    "entity_id" TEXT,
    "external_id" TEXT NOT NULL,
    "row_number" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "error_message" TEXT,
    "raw_data" JSONB,

    CONSTRAINT "import_records_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "import_sessions_created_by_id_idx" ON "import_sessions"("created_by_id");

-- CreateIndex
CREATE INDEX "import_sessions_source_idx" ON "import_sessions"("source");

-- CreateIndex
CREATE INDEX "import_sessions_status_idx" ON "import_sessions"("status");

-- CreateIndex
CREATE INDEX "import_records_entity_type_entity_id_idx" ON "import_records"("entity_type", "entity_id");

-- CreateIndex
CREATE INDEX "import_records_external_id_idx" ON "import_records"("external_id");

-- CreateIndex
CREATE UNIQUE INDEX "import_records_session_id_entity_type_external_id_key" ON "import_records"("session_id", "entity_type", "external_id");

-- AddForeignKey
ALTER TABLE "import_sessions" ADD CONSTRAINT "import_sessions_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "import_records" ADD CONSTRAINT "import_records_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "import_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
