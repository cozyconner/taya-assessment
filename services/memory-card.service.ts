/**
 * Generate memory card structured data from a transcript using OpenAI + Zod.
 * Used by API route and actions; testable in isolation.
 */

import OpenAI from "openai";
import { z } from "zod";
import { MOOD_VALUES } from "@/types/types";

export const MemoryCardOutputSchema = z.object({
  title: z.string().min(1).max(200),
  mood: z.enum(MOOD_VALUES),
  categories: z
    .array(z.string())
    .max(3)
    .transform((arr) => arr.map((s) => s.trim()).filter(Boolean)),
  actionItems: z
    .array(z.string())
    .max(5)
    .transform((arr) => arr.map((s) => s.trim()).filter(Boolean)),
});

export type MemoryCardOutput = z.infer<typeof MemoryCardOutputSchema>;

const SYSTEM_PROMPT = `You are a helpful assistant that turns a spoken transcript into a structured memory card.

Rules:
- If unsure about mood, choose "reflective".
- Produce a high-quality, concise title that captures the essence of the conversation.
- Categories: up to 3 short tags/labels (e.g. "work", "personal", "ideas")—generate whatever fits the transcript.
- Extract only actionable items (imperative, things the person could do): e.g. "Book restaurant", "Send status update". Do not include vague or non-actionable notes.
- Use at most 3 categories and at most 5 action items.
- Return only valid JSON matching the schema: title (string), mood (enum), categories (array of strings, ≤3), actionItems (array of strings, ≤5, trimmed, no empty).`;

const RETRY_PROMPT_APPEND =
  " Return JSON only matching this schema: { title: string, mood: enum (see Mood values), categories: string[] (≤3), actionItems: string[] (≤5) }. No other text.";

export async function generateMemoryCard(transcript: string): Promise<MemoryCardOutput> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not set");
  }

  const openai = new OpenAI({ apiKey });

  const userContent = `Transcript:\n\n${transcript}`;

  async function attempt(extraInstruction?: string): Promise<MemoryCardOutput> {
    const content = extraInstruction
      ? `${userContent}\n\n${extraInstruction}`
      : userContent;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content },
      ],
      response_format: { type: "json_object" },
    });

    const raw = completion.choices[0]?.message?.content;
    if (!raw) {
      throw new Error("OpenAI returned no content");
    }

    const parsed = JSON.parse(raw) as unknown;
    return MemoryCardOutputSchema.parse(parsed);
  }

  try {
    return await attempt();
  } catch (firstError) {
    try {
      return await attempt(RETRY_PROMPT_APPEND);
    } catch {
      throw firstError;
    }
  }
}
