import { NextResponse } from "next/server";
import { generateMemoryCard } from "@/services/memory-card.service";
import { prisma } from "@/lib/db";
import type { Mood } from "@prisma/client";

export async function GET() {
  try {
    const cards = await prisma.memoryCard.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    const list = cards.map((c) => ({
      id: c.id,
      createdAt: c.createdAt,
      title: c.title,
      transcript: c.transcript,
      mood: c.mood,
      categories: c.categories,
      actionItems: c.actionItems,
    }));

    return NextResponse.json(list);
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

    return NextResponse.json({
      id: card.id,
      createdAt: card.createdAt,
      title: card.title,
      transcript: card.transcript,
      mood: card.mood,
      categories: card.categories,
      actionItems: card.actionItems,
    });
  } catch (err) {
    console.error("POST /api/memory-card error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to create card" },
      { status: 500 }
    );
  }
}
