import AudioRecord from "./components/AudioRecord";
import MemoryCards from "./components/MemoryCards";
import { getMemoryCardsAction } from "./actions/memory-card.actions";
import type { MemoryCardDisplay } from "@/types/types";

function groupCardsByDate(cards: MemoryCardDisplay[]) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const groups: { label: string; cards: MemoryCardDisplay[] }[] = [];
  const todayCards: MemoryCardDisplay[] = [];
  const yesterdayCards: MemoryCardDisplay[] = [];
  const olderCards: MemoryCardDisplay[] = [];

  for (const card of cards) {
    const date = new Date(card.createdAt);
    date.setHours(0, 0, 0, 0);
    if (date.getTime() === today.getTime()) {
      todayCards.push(card);
    } else if (date.getTime() === yesterday.getTime()) {
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
      <AudioRecord />

      {renderStickyHeader()}

      <MemoryCards groupedMemoryCards={groupedMemoryCards} />
    </div>
  );
}
