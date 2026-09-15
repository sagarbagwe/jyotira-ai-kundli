-- Keep required report section selections aligned with the Prisma schema.
ALTER TABLE "Report"
ALTER COLUMN "selectedSections" SET NOT NULL;
