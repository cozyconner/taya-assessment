import { NextResponse } from "next/server";
import { generateMemoryCard_service } from "@/services/memory-card.service";
import { prisma } from "@/lib/db";
import type { Mood } from "@prisma/client";
import type { MemoryCardDto, CreateMemoryCardDto } from "@/types/types";

export async function GET() {
  try {
    const cards = await prisma.memoryCard.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return NextResponse.json(cards);
  } catch (err) {
    console.error("GET /api/memory-card error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to load cards" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { transcript?: string };

    const transcript = typeof body.transcript === "string" ? body.transcript.trim() : "";

    if (!transcript) {
      return NextResponse.json(
        { error: "Missing transcript" },
        { status: 400 }
      );
    }

    const generatedMemoryCard = await generateMemoryCard_service(transcript);

    const createPayload: CreateMemoryCardDto = {
      transcript,
      title: generatedMemoryCard.title,
      mood: generatedMemoryCard.mood as Mood,
      categories: generatedMemoryCard.categories,
      actionItems: generatedMemoryCard.actionItems,
    };

    const memoryCard: MemoryCardDto = await prisma.memoryCard.create({
      data: createPayload,
    });

    return NextResponse.json(memoryCard);
  } catch (err) {
    console.error("POST /api/memory-card error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to create card" },
      { status: 500 }
    );
  }
}
