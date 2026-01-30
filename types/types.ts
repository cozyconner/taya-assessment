/**
 * Mood is constrained to prevent drift and keep UX consistent.
 * Balanced intentionally for a meditative app:
 * - 6 positive
 * - 3 neutral (including mixed)
 * - 2 negative
 */
import { Mood, Prisma } from "@prisma/client";
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

/**
 * Full MemoryCard DTO.
 * Uses Prisma type for type safety (already includes id, createdAt, updatedAt).
 */
export type MemoryCardDto = Prisma.MemoryCardGetPayload<Record<string, never>>;

/**
 * Payload for creating a MemoryCard.
 * Excludes auto-generated fields (id, createdAt, updatedAt).
 * Uses Prisma's UncheckedCreateInput for direct field assignment.
 */
export type CreateMemoryCardDto = Omit<
  Prisma.MemoryCardUncheckedCreateInput,
  "id" | "createdAt" | "updatedAt"
>;

/**
 * Payload for deleting a MemoryCard.
 */
export interface DeleteMemoryCardDto {
  id: string;
}

/**
 * Memory card display type for UI components.
 * Extends MemoryCardDto with client-only UI state for optimistic updates.
 */
export type MemoryCardDisplay = MemoryCardDto & {
  /**
   * Client-only UI state for optimistic/temporary cards.
   * - pending: show blurred overlay + spinner
   * - done: fade overlay out (used briefly before swapping to server-rendered card)
   * - error: show error overlay
   */
  uiState?: "pending" | "done" | "error";
  /** Optional error message when uiState === "error". */
  uiError?: string;
};
