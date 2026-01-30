import AudioRecordButton from "./components/AudioRecordButton";
import MemoryCards, { GroupedMemoryCards } from "./components/MemoryCards";
import { getMemoryCardsAction } from "./actions/memory-card.actions";
import { Suspense } from "react";
import type { MemoryCardDisplay } from "@/types/types";

function groupCardsByDate(memoryCards: MemoryCardDisplay[]): GroupedMemoryCards[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const groups: { label: string; cards: MemoryCardDisplay[] }[] = [];
  const todayCards: MemoryCardDisplay[] = [];
  const yesterdayCards: MemoryCardDisplay[] = [];
  const olderCards: MemoryCardDisplay[] = [];

  for (const card of memoryCards) {
    const createdAt = new Date(card.createdAt);
    createdAt.setHours(0, 0, 0, 0);
    if (createdAt.getTime() === today.getTime()) {
      todayCards.push(card);
    } else if (createdAt.getTime() === yesterday.getTime()) {
      yesterdayCards.push(card);
    } else {
      olderCards.push(card);
    }
  }

  if (todayCards.length) {
    groups.push({ label: "Today", cards: todayCards });
  }
  if (yesterdayCards.length) {
    groups.push({ label: "Yesterday", cards: yesterdayCards });
  }
  if (olderCards.length) {
    groups.push({ label: "Earlier", cards: olderCards });
  }

  return groups;
}

function renderStickyHeader() {
  return (
    <section
      data-id="stickyHeader"
      className="sticky top-0 z-10 min-h-[150px] px-4 pt-8 pb-4"
      style={{
        background:
          "linear-gradient(180deg, rgb(150 210 200 / 0.85) 0%, rgb(184 230 222 / 0.4) 50%, transparent 100%)",
      }}
    >
      {/* Blur fades from top (blurry) to bottom (clear) via mask */}
      <div
        className="pointer-events-none absolute inset-0 z-0 backdrop-blur-md"
        style={{
          WebkitMaskImage: "linear-gradient(to bottom, black, transparent)",
          maskImage: "linear-gradient(to bottom, black, transparent)",
        }}
        aria-hidden
      />
    </section>
  );
}

export default async function MemoryCardPage() {
  const memoryCards = await getMemoryCardsAction();
  const groupedMemoryCards = groupCardsByDate(memoryCards);

  return (
    <div className="relative min-h-screen bg-[#f5f0e8] font-sans">
      <AudioRecordButton />
      {renderStickyHeader()}

      {/* We need Suspense because of the admin flag on <MemoryCards /> which uses useSearchParams() */}
      <Suspense fallback={null}>
        <MemoryCards groupedMemoryCards={groupedMemoryCards} />
      </Suspense>
    </div>
  );
}
