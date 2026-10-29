/*
  Warnings:

  - A unique constraint covering the columns `[external_id]` on the table `activities` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[external_id]` on the table `deals` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[external_id]` on the table `organizations` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[external_id]` on the table `people` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "activities" ADD COLUMN     "external_id" TEXT;

-- AlterTable
ALTER TABLE "deals" ADD COLUMN     "external_id" TEXT;

-- AlterTable
ALTER TABLE "organizations" ADD COLUMN     "external_id" TEXT;

-- AlterTable
ALTER TABLE "people" ADD COLUMN     "external_id" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "activities_external_id_key" ON "activities"("external_id");

-- CreateIndex
CREATE UNIQUE INDEX "deals_external_id_key" ON "deals"("external_id");

-- CreateIndex
CREATE UNIQUE INDEX "organizations_external_id_key" ON "organizations"("external_id");

-- CreateIndex
CREATE UNIQUE INDEX "people_external_id_key" ON "people"("external_id");
