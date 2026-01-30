/**
 * Mood is constrained to prevent drift and keep UX consistent.
 * Balanced intentionally for a meditative app:
 * - 6 positive
 * - 2 neutral
 * - 2 negative
 */
export { Mood } from "@prisma/client";

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
