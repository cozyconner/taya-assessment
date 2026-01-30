-- CreateEnum
CREATE TYPE "Mood" AS ENUM ('relaxed', 'excited', 'content', 'grateful', 'hopeful', 'inspired', 'pensive', 'reflective', 'anxious', 'frustrated');

-- CreateTable
CREATE TABLE "MemoryCard" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "transcript" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "mood" "Mood" NOT NULL,
    "categories" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "actionItems" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "raw" JSONB,

    CONSTRAINT "MemoryCard_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MemoryCard_createdAt_idx" ON "MemoryCard"("createdAt");

-- CreateIndex
CREATE INDEX "MemoryCard_mood_idx" ON "MemoryCard"("mood");
