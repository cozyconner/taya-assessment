/**
 * Generate memory card structured data from a transcript using OpenAI + Zod.
 * Used by API route and actions; testable in isolation.
 */

import OpenAI from "openai";
import { z } from "zod";
import { MOOD_VALUES } from "@/types/types";
import {
  MEMORY_CARD_RETRY_PROMPT_APPEND,
  MEMORY_CARD_SYSTEM_PROMPT,
  MEMORY_CARD_USER_MESSAGE_PREFIX,
} from "./prompts";

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

export async function generateMemoryCard(transcript: string): Promise<MemoryCardOutput> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not set");
  }

  const openai = new OpenAI({ apiKey });

  const userContent = `${MEMORY_CARD_USER_MESSAGE_PREFIX}${transcript}`;

  async function attempt(extraInstruction?: string): Promise<MemoryCardOutput> {
    const content = extraInstruction
      ? `${userContent}\n\n${extraInstruction}`
      : userContent;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: MEMORY_CARD_SYSTEM_PROMPT },
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
      return await attempt(MEMORY_CARD_RETRY_PROMPT_APPEND);
    } catch {
      throw firstError;
    }
  }
}
