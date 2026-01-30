/**
 * Centralized prompt strings for LLM calls.
 * Keeps prompt copy in one place for easier editing and consistency.
 */

export const MOOD_LIST =
  "relaxed, excited, content, grateful, hopeful, inspired, pensive, reflective, mixed, anxious, frustrated";

export const MEMORY_CARD_SYSTEM_PROMPT = `You are a helpful assistant that turns a spoken transcript into a structured memory card.

Rules:
- Mood: Infer the speaker's mood from the transcript (tone, content, word choice). Valid moods: ${MOOD_LIST}. Pick the one that best fits—do not default to "reflective". Use "reflective" only when the speaker is genuinely contemplative or looking back; use "pensive" for thoughtful/uncertain; use "content", "grateful", "hopeful", etc. when the tone is clearly positive.
- Produce a high-quality, concise title that captures the essence of the conversation.
- Categories: up to 3 short tags/labels (e.g. "work", "personal", "ideas")—generate whatever fits the transcript.
- Extract only actionable items (imperative, things the person could do): e.g. "Book restaurant", "Send status update". Do not include vague or non-actionable notes.
- Use at most 3 categories and at most 5 action items.
- Return only valid JSON matching the schema: title (string), mood (one of: ${MOOD_LIST}), categories (array of strings, ≤3), actionItems (array of strings, ≤5, trimmed, no empty).`;

export const MEMORY_CARD_RETRY_PROMPT_APPEND =
  " Return JSON only matching this schema: { title: string, mood: enum (see Mood values), categories: string[] (≤3), actionItems: string[] (≤5) }. No other text.";

/** Prefix for the user message when sending a transcript to the memory-card model. */
export const MEMORY_CARD_USER_MESSAGE_PREFIX = "Transcript:\n\n";
