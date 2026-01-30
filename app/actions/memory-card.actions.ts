"use server";

import { transcribeAudio, isTranscriptTooShort } from "@/services/transcribe.service";
import { generateMemoryCard } from "@/services/memory-card.service";
import { prisma } from "@/lib/db";
import type { Mood } from "@prisma/client";
import type { MemoryCardDisplay } from "@/types/types";

export async function getMemoryCards(): Promise<MemoryCardDisplay[]> {
  const cards = await prisma.memoryCard.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return cards.map((c) => ({
    id: c.id,
    createdAt: c.createdAt,
    title: c.title,
    transcript: c.transcript,
    mood: c.mood,
    categories: c.categories,
    actionItems: c.actionItems,
  }));
}

export type CreateMemoryCardFromAudioResult =
  | { ok: true; card: MemoryCardDisplay }
  | { ok: false; error: string };

/**
 * Records flow: transcribe audio → generate memory card → persist.
 * Returns the new card or a friendly error (e.g. "Couldn't hear audio...").
 */
export async function createMemoryCardFromAudio(
  formData: FormData
): Promise<CreateMemoryCardFromAudioResult> {
  const audio = formData.get("audio");

  if (!audio || !(audio instanceof Blob)) {
    return { ok: false, error: "Missing or invalid audio file" };
  }

  const buffer = await audio.arrayBuffer();
  if (buffer.byteLength === 0) {
    return { ok: false, error: "Couldn't hear audio. Please try again and speak clearly." };
  }

  try {
    const mimeType = audio.type || "audio/webm";
    const { transcript } = await transcribeAudio(buffer, mimeType);

    if (isTranscriptTooShort(transcript)) {
      return { ok: false, error: "Couldn't hear audio. Please try again and speak clearly." };
    }

    const generated = await generateMemoryCard(transcript);

    const card = await prisma.memoryCard.create({
      data: {
        transcript,
        title: generated.title,
        mood: generated.mood as Mood,
        categories: generated.categories,
        actionItems: generated.actionItems,
      },
    });

    return {
      ok: true,
      card: {
        id: card.id,
        createdAt: card.createdAt,
        title: card.title,
        transcript: card.transcript,
        mood: card.mood,
        categories: card.categories,
        actionItems: card.actionItems,
      },
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Something went wrong.";
    return { ok: false, error: message };
  }
}
