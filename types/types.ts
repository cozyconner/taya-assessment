/**
 * Mood is constrained to prevent drift and keep UX consistent.
 * Balanced intentionally for a meditative app:
 * - 6 positive
 * - 2 neutral
 * - 2 negative
 */
export { Mood } from "@prisma/client";

/** Memory card display type aligned with Prisma MemoryCard schema */
export interface MemoryCardDisplay {
  id: string;
  createdAt: Date;
  title: string;
  transcript: string;
  mood: string;
  categories: string[];
  actionItems: string[];
}
