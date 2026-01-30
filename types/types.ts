/**
 * Mood is constrained to prevent drift and keep UX consistent.
 * Balanced intentionally for a meditative app:
 * - 6 positive
 * - 3 neutral (including mixed)
 * - 2 negative
 */
import { Mood } from "@prisma/client";
export { Mood };

/** Mood enum values for Zod/validation; must stay in sync with Prisma Mood. */
export const MOOD_VALUES = Object.values(Mood) as [string, ...string[]];

/**
 * UI states for the audio recording flow.
 * Flow: idle → recording → uploading → transcribing → synthesizing → done
 * Any step can transition to error instead.
 */
export type AudioRecordState =
  | "idle"
  | "recording"
  | "uploading"
  | "transcribing"
  | "synthesizing"
  | "done"
  | "error";

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
