"use server";

import { transcribeAudio_service, isTranscriptTooShort_service } from "@/services/transcribe.service";
import { generateMemoryCard_service } from "@/services/memory-card.service";
import { prisma } from "@/lib/db";
import type { Mood } from "@prisma/client";
import type {
  MemoryCardDto,
  CreateMemoryCardDto,
  DeleteMemoryCardDto,
} from "@/types/types";

export async function getMemoryCardsAction(): Promise<MemoryCardDto[]> {
  const cards = await prisma.memoryCard.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return cards;
}

export type CreateMemoryCardFromAudioResult =
  | { ok: true; card: MemoryCardDto }
  | { ok: false; error: string };

/**
 * Records flow: transcribe audio → generate memory card → persist.
 * Returns the new card or a friendly error (e.g. "Couldn't hear audio...").
 */
export async function createMemoryCardFromAudioAction(
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
    const { transcript } = await transcribeAudio_service(buffer, mimeType);

    if (isTranscriptTooShort_service(transcript)) {
      return { ok: false, error: "Couldn't hear audio. Please try again and speak clearly." };
    }

    const generated = await generateMemoryCard_service(transcript);

    const createPayload: CreateMemoryCardDto = {
      transcript,
      title: generated.title,
      mood: generated.mood as Mood,
      categories: generated.categories,
      actionItems: generated.actionItems,
    };

    const card = await prisma.memoryCard.create({
      data: createPayload,
    });

    return {
      ok: true,
      card,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Something went wrong.";
    return { ok: false, error: message };
  }
}

export type DeleteMemoryCardResult = { ok: true } | { ok: false; error: string };

export async function deleteMemoryCardAction(
  payload: DeleteMemoryCardDto
): Promise<DeleteMemoryCardResult> {
  try {
    await prisma.memoryCard.delete({ where: { id: payload.id } });
    return { ok: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to delete";
    return { ok: false, error: message };
  }
}
