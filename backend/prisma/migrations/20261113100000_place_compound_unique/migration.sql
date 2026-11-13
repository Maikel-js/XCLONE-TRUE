-- AlterTable: unique compuesto para el upsert de Place por (source, sourceId)
CREATE UNIQUE INDEX "Place_source_sourceId_key" ON "Place"("source", "sourceId");
