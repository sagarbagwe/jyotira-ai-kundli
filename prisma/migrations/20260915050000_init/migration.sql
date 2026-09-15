-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('USER', 'ADMIN');
CREATE TYPE "BirthTimeAccuracy" AS ENUM ('EXACT', 'APPROXIMATE', 'UNKNOWN');
CREATE TYPE "JobStatus" AS ENUM ('QUEUED', 'CALCULATING', 'ANALYZING', 'GENERATING_REPORT', 'COMPLETED', 'FAILED');
CREATE TYPE "ReportStatus" AS ENUM ('DRAFT', 'GENERATING', 'READY', 'FAILED');
CREATE TYPE "ReportType" AS ENUM ('BASIC', 'DETAILED', 'PREMIUM');
CREATE TYPE "UploadStatus" AS ENUM ('UPLOADED', 'EXTRACTING', 'EXTRACTED', 'REJECTED', 'FAILED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT,
    "emailVerified" TIMESTAMP(3),
    "image" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'USER',
    "locale" TEXT NOT NULL DEFAULT 'en',
    "timezone" TEXT NOT NULL DEFAULT 'Asia/Kolkata',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,
    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

CREATE TABLE "BirthProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "dateOfBirth" DATE NOT NULL,
    "timeOfBirth" TEXT NOT NULL,
    "place" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "latitude" DECIMAL(9,6) NOT NULL,
    "longitude" DECIMAL(9,6) NOT NULL,
    "timezone" TEXT NOT NULL,
    "timeAccuracy" "BirthTimeAccuracy" NOT NULL,
    "source" TEXT NOT NULL DEFAULT 'manual',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "BirthProfile_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "KundliChart" (
    "id" TEXT NOT NULL,
    "birthProfileId" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "engine" TEXT NOT NULL,
    "engineVersion" TEXT NOT NULL,
    "ayanamsa" TEXT NOT NULL,
    "houseSystem" TEXT NOT NULL,
    "nodeType" TEXT NOT NULL,
    "julianDayUt" DECIMAL(16,8) NOT NULL,
    "calculatedData" JSONB NOT NULL,
    "calculatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "checksum" TEXT NOT NULL,
    CONSTRAINT "KundliChart_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "PlanetaryPosition" (
    "id" TEXT NOT NULL,
    "chartId" TEXT NOT NULL,
    "planet" TEXT NOT NULL,
    "tropicalLongitude" DECIMAL(10,6) NOT NULL,
    "siderealLongitude" DECIMAL(10,6) NOT NULL,
    "latitude" DECIMAL(10,6) NOT NULL,
    "speed" DECIMAL(10,6) NOT NULL,
    "sign" TEXT NOT NULL,
    "degreeInSign" DECIMAL(10,6) NOT NULL,
    "house" INTEGER NOT NULL,
    "nakshatra" TEXT NOT NULL,
    "pada" INTEGER NOT NULL,
    "retrograde" BOOLEAN NOT NULL,
    "combust" BOOLEAN NOT NULL,
    "dignity" TEXT NOT NULL,
    "strengthScore" INTEGER NOT NULL,
    "details" JSONB NOT NULL,
    CONSTRAINT "PlanetaryPosition_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "House" (
    "id" TEXT NOT NULL,
    "chartId" TEXT NOT NULL,
    "number" INTEGER NOT NULL,
    "sign" TEXT NOT NULL,
    "lord" TEXT NOT NULL,
    "cuspSidereal" DECIMAL(10,6) NOT NULL,
    "strengthScore" INTEGER NOT NULL,
    "details" JSONB NOT NULL,
    CONSTRAINT "House_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "DivisionalChart" (
    "id" TEXT NOT NULL,
    "chartId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "division" INTEGER NOT NULL,
    "purpose" TEXT NOT NULL,
    "reliability" TEXT NOT NULL,
    "available" BOOLEAN NOT NULL,
    "ruleSet" TEXT NOT NULL,
    "placements" JSONB NOT NULL,
    CONSTRAINT "DivisionalChart_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Dasha" (
    "id" TEXT NOT NULL,
    "chartId" TEXT NOT NULL,
    "system" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "lord" TEXT NOT NULL,
    "parentLord" TEXT,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "path" TEXT NOT NULL,
    "details" JSONB,
    CONSTRAINT "Dasha_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Transit" (
    "id" TEXT NOT NULL,
    "chartId" TEXT NOT NULL,
    "planet" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "eventDate" TIMESTAMP(3) NOT NULL,
    "fromSign" TEXT,
    "toSign" TEXT,
    "longitude" DECIMAL(10,6),
    "retrograde" BOOLEAN NOT NULL,
    "natalHouse" INTEGER,
    "details" JSONB,
    CONSTRAINT "Transit_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Yoga" (
    "id" TEXT NOT NULL,
    "chartId" TEXT NOT NULL,
    "ruleId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "detected" BOOLEAN NOT NULL,
    "status" TEXT NOT NULL,
    "basis" JSONB NOT NULL,
    "rule" TEXT NOT NULL,
    "caveat" TEXT NOT NULL,
    CONSTRAINT "Yoga_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Dosha" (
    "id" TEXT NOT NULL,
    "chartId" TEXT NOT NULL,
    "ruleId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "detected" BOOLEAN NOT NULL,
    "status" TEXT NOT NULL,
    "severity" TEXT,
    "basis" JSONB NOT NULL,
    "rule" TEXT NOT NULL,
    "caveat" TEXT NOT NULL,
    CONSTRAINT "Dosha_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Report" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "chartId" TEXT NOT NULL,
    "status" "ReportStatus" NOT NULL DEFAULT 'DRAFT',
    "type" "ReportType" NOT NULL,
    "language" TEXT NOT NULL,
    "selectedSections" TEXT[],
    "rangeStart" TIMESTAMP(3),
    "rangeEnd" TIMESTAMP(3),
    "title" TEXT NOT NULL,
    "summary" TEXT,
    "interpretation" JSONB,
    "pdfStorageKey" TEXT,
    "shareEnabled" BOOLEAN NOT NULL DEFAULT false,
    "shareToken" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Report_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ReportSection" (
    "id" TEXT NOT NULL,
    "reportId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL,
    "content" JSONB NOT NULL,
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "model" TEXT,
    CONSTRAINT "ReportSection_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AIQuestion" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "reportId" TEXT,
    "question" TEXT NOT NULL,
    "answer" JSONB,
    "model" TEXT,
    "latencyMs" INTEGER,
    "inputTokens" INTEGER,
    "outputTokens" INTEGER,
    "status" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AIQuestion_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "UploadedFile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "birthProfileId" TEXT,
    "storageKey" TEXT NOT NULL,
    "originalName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "sizeBytes" INTEGER NOT NULL,
    "sha256" TEXT NOT NULL,
    "status" "UploadStatus" NOT NULL DEFAULT 'UPLOADED',
    "extractedData" JSONB,
    "errorCode" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "UploadedFile_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "GenerationJob" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "reportId" TEXT,
    "status" "JobStatus" NOT NULL DEFAULT 'QUEUED',
    "progress" INTEGER NOT NULL DEFAULT 0,
    "currentStep" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "result" JSONB,
    "errorCode" TEXT,
    "errorMessage" TEXT,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "queuedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "GenerationJob_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "UsageEvent" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "kind" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "durationMs" INTEGER,
    "model" TEXT,
    "success" BOOLEAN NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "UsageEvent_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "SystemError" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "area" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "fingerprint" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SystemError_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");
CREATE INDEX "Account_userId_idx" ON "Account"("userId");
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");
CREATE INDEX "Session_userId_idx" ON "Session"("userId");
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");
CREATE INDEX "BirthProfile_userId_createdAt_idx" ON "BirthProfile"("userId", "createdAt");
CREATE UNIQUE INDEX "KundliChart_birthProfileId_version_key" ON "KundliChart"("birthProfileId", "version");
CREATE INDEX "KundliChart_birthProfileId_calculatedAt_idx" ON "KundliChart"("birthProfileId", "calculatedAt");
CREATE UNIQUE INDEX "PlanetaryPosition_chartId_planet_key" ON "PlanetaryPosition"("chartId", "planet");
CREATE INDEX "PlanetaryPosition_chartId_house_idx" ON "PlanetaryPosition"("chartId", "house");
CREATE UNIQUE INDEX "House_chartId_number_key" ON "House"("chartId", "number");
CREATE UNIQUE INDEX "DivisionalChart_chartId_code_key" ON "DivisionalChart"("chartId", "code");
CREATE INDEX "Dasha_chartId_startDate_endDate_idx" ON "Dasha"("chartId", "startDate", "endDate");
CREATE INDEX "Dasha_chartId_path_idx" ON "Dasha"("chartId", "path");
CREATE INDEX "Transit_chartId_eventDate_idx" ON "Transit"("chartId", "eventDate");
CREATE UNIQUE INDEX "Yoga_chartId_ruleId_key" ON "Yoga"("chartId", "ruleId");
CREATE UNIQUE INDEX "Dosha_chartId_ruleId_key" ON "Dosha"("chartId", "ruleId");
CREATE UNIQUE INDEX "Report_shareToken_key" ON "Report"("shareToken");
CREATE INDEX "Report_userId_createdAt_idx" ON "Report"("userId", "createdAt");
CREATE INDEX "Report_chartId_idx" ON "Report"("chartId");
CREATE UNIQUE INDEX "ReportSection_reportId_key_key" ON "ReportSection"("reportId", "key");
CREATE INDEX "AIQuestion_userId_createdAt_idx" ON "AIQuestion"("userId", "createdAt");
CREATE INDEX "AIQuestion_reportId_idx" ON "AIQuestion"("reportId");
CREATE INDEX "UploadedFile_userId_createdAt_idx" ON "UploadedFile"("userId", "createdAt");
CREATE INDEX "UploadedFile_sha256_idx" ON "UploadedFile"("sha256");
CREATE INDEX "GenerationJob_userId_queuedAt_idx" ON "GenerationJob"("userId", "queuedAt");
CREATE INDEX "GenerationJob_status_queuedAt_idx" ON "GenerationJob"("status", "queuedAt");
CREATE INDEX "UsageEvent_kind_createdAt_idx" ON "UsageEvent"("kind", "createdAt");
CREATE INDEX "UsageEvent_userId_createdAt_idx" ON "UsageEvent"("userId", "createdAt");
CREATE INDEX "SystemError_area_createdAt_idx" ON "SystemError"("area", "createdAt");
CREATE INDEX "SystemError_fingerprint_idx" ON "SystemError"("fingerprint");

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "BirthProfile" ADD CONSTRAINT "BirthProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "KundliChart" ADD CONSTRAINT "KundliChart_birthProfileId_fkey" FOREIGN KEY ("birthProfileId") REFERENCES "BirthProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PlanetaryPosition" ADD CONSTRAINT "PlanetaryPosition_chartId_fkey" FOREIGN KEY ("chartId") REFERENCES "KundliChart"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "House" ADD CONSTRAINT "House_chartId_fkey" FOREIGN KEY ("chartId") REFERENCES "KundliChart"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "DivisionalChart" ADD CONSTRAINT "DivisionalChart_chartId_fkey" FOREIGN KEY ("chartId") REFERENCES "KundliChart"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Dasha" ADD CONSTRAINT "Dasha_chartId_fkey" FOREIGN KEY ("chartId") REFERENCES "KundliChart"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Transit" ADD CONSTRAINT "Transit_chartId_fkey" FOREIGN KEY ("chartId") REFERENCES "KundliChart"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Yoga" ADD CONSTRAINT "Yoga_chartId_fkey" FOREIGN KEY ("chartId") REFERENCES "KundliChart"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Dosha" ADD CONSTRAINT "Dosha_chartId_fkey" FOREIGN KEY ("chartId") REFERENCES "KundliChart"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Report" ADD CONSTRAINT "Report_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Report" ADD CONSTRAINT "Report_chartId_fkey" FOREIGN KEY ("chartId") REFERENCES "KundliChart"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ReportSection" ADD CONSTRAINT "ReportSection_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "Report"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AIQuestion" ADD CONSTRAINT "AIQuestion_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AIQuestion" ADD CONSTRAINT "AIQuestion_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "Report"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "UploadedFile" ADD CONSTRAINT "UploadedFile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "UploadedFile" ADD CONSTRAINT "UploadedFile_birthProfileId_fkey" FOREIGN KEY ("birthProfileId") REFERENCES "BirthProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "GenerationJob" ADD CONSTRAINT "GenerationJob_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "GenerationJob" ADD CONSTRAINT "GenerationJob_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "Report"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "UsageEvent" ADD CONSTRAINT "UsageEvent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
