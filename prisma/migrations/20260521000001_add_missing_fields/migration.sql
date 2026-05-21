-- ─────────────────────────────────────────────────────────────────────────────
-- Migration: add_missing_fields
-- Adds all columns and tables that were introduced after the initial migration.
-- Written with IF NOT EXISTS / DO $$ guards so it is safe to re-run.
-- ─────────────────────────────────────────────────────────────────────────────

-- ── User: new auth/security columns ─────────────────────────────────────────
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "requestedRole"      TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "emailVerified"      BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "verificationOtp"    TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "otpExpiry"          TIMESTAMP(3);
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "passwordResetToken" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "resetTokenExpiry"   TIMESTAMP(3);
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "loginAttempts"      INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "lockedUntil"        TIMESTAMP(3);

-- ── Event: featured flag ─────────────────────────────────────────────────────
ALTER TABLE "Event" ADD COLUMN IF NOT EXISTS "featured" BOOLEAN NOT NULL DEFAULT false;

-- ── ResearchArticle: all new columns ────────────────────────────────────────
ALTER TABLE "ResearchArticle" ADD COLUMN IF NOT EXISTS "publicationStatus"    TEXT NOT NULL DEFAULT 'draft';
ALTER TABLE "ResearchArticle" ADD COLUMN IF NOT EXISTS "internalContributors" TEXT NOT NULL DEFAULT '[]';
ALTER TABLE "ResearchArticle" ADD COLUMN IF NOT EXISTS "publicationDate"      TEXT NOT NULL DEFAULT '';
ALTER TABLE "ResearchArticle" ADD COLUMN IF NOT EXISTS "pdfUrl"               TEXT;
ALTER TABLE "ResearchArticle" ADD COLUMN IF NOT EXISTS "externalUrl"          TEXT;
ALTER TABLE "ResearchArticle" ADD COLUMN IF NOT EXISTS "githubUrl"            TEXT;
ALTER TABLE "ResearchArticle" ADD COLUMN IF NOT EXISTS "datasetUrl"           TEXT;
ALTER TABLE "ResearchArticle" ADD COLUMN IF NOT EXISTS "content"              TEXT;
ALTER TABLE "ResearchArticle" ADD COLUMN IF NOT EXISTS "isPremium"            BOOLEAN NOT NULL DEFAULT false;

-- ── ContactMessage ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "ContactMessage" (
    "id"           TEXT NOT NULL,
    "name"         TEXT NOT NULL,
    "email"        TEXT NOT NULL,
    "topic"        TEXT NOT NULL,
    "organisation" TEXT,
    "message"      TEXT NOT NULL,
    "read"         BOOLEAN NOT NULL DEFAULT false,
    "createdAt"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ContactMessage_pkey" PRIMARY KEY ("id")
);

-- ── Vacancy enums ────────────────────────────────────────────────────────────
DO $$ BEGIN
    CREATE TYPE "VacancyType"   AS ENUM ('FULL_TIME', 'PART_TIME', 'INTERNSHIP', 'VOLUNTEER');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE "VacancyStatus" AS ENUM ('DRAFT', 'OPEN', 'CLOSED');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ── Vacancy ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "Vacancy" (
    "id"          TEXT NOT NULL,
    "title"       TEXT NOT NULL,
    "type"        "VacancyType" NOT NULL,
    "department"  TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "deadline"    TIMESTAMP(3),
    "status"      "VacancyStatus" NOT NULL DEFAULT 'DRAFT',
    "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Vacancy_pkey" PRIMARY KEY ("id")
);

-- ── VacancyApplication ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "VacancyApplication" (
    "id"         TEXT NOT NULL,
    "vacancyId"  TEXT NOT NULL,
    "name"       TEXT NOT NULL,
    "email"      TEXT NOT NULL,
    "phone"      TEXT,
    "message"    TEXT,
    "read"       BOOLEAN NOT NULL DEFAULT false,
    "createdAt"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VacancyApplication_pkey" PRIMARY KEY ("id")
);

DO $$ BEGIN
    ALTER TABLE "VacancyApplication"
        ADD CONSTRAINT "VacancyApplication_vacancyId_fkey"
        FOREIGN KEY ("vacancyId") REFERENCES "Vacancy"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE INDEX IF NOT EXISTS "VacancyApplication_vacancyId_idx" ON "VacancyApplication"("vacancyId");

-- ── Mentor ───────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "Mentor" (
    "id"        TEXT NOT NULL,
    "name"      TEXT NOT NULL,
    "expertise" TEXT NOT NULL,
    "bio"       TEXT,
    "imageUrl"  TEXT,
    "linkedIn"  TEXT,
    "active"    BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Mentor_pkey" PRIMARY KEY ("id")
);

-- ── MentoringProgram ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "MentoringProgram" (
    "id"          TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "duration"    TEXT NOT NULL,
    "structure"   TEXT,
    "nextCohort"  TIMESTAMP(3),
    "isOpen"      BOOLEAN NOT NULL DEFAULT false,
    "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MentoringProgram_pkey" PRIMARY KEY ("id")
);

-- ── MentoringApplication ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "MentoringApplication" (
    "id"         TEXT NOT NULL,
    "programId"  TEXT NOT NULL,
    "name"       TEXT NOT NULL,
    "email"      TEXT NOT NULL,
    "phone"      TEXT,
    "background" TEXT,
    "goals"      TEXT,
    "read"       BOOLEAN NOT NULL DEFAULT false,
    "createdAt"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MentoringApplication_pkey" PRIMARY KEY ("id")
);

DO $$ BEGIN
    ALTER TABLE "MentoringApplication"
        ADD CONSTRAINT "MentoringApplication_programId_fkey"
        FOREIGN KEY ("programId") REFERENCES "MentoringProgram"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE INDEX IF NOT EXISTS "MentoringApplication_programId_idx" ON "MentoringApplication"("programId");

-- ── TeamMember ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "TeamMember" (
    "id"        TEXT NOT NULL,
    "name"      TEXT NOT NULL,
    "role"      TEXT NOT NULL,
    "bio"       TEXT NOT NULL,
    "imageUrl"  TEXT,
    "featured"  BOOLEAN NOT NULL DEFAULT false,
    "order"     INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TeamMember_pkey" PRIMARY KEY ("id")
);
