import AudioRecord from "./components/AudioRecord";
import MemoryCard from "./components/MemoryCard";
import { MOCK_MEMORY_CARDS } from "./data";
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
    const d = new Date(card.createdAt);
    d.setHours(0, 0, 0, 0);
    if (d.getTime() === today.getTime()) todayCards.push(card);
    else if (d.getTime() === yesterday.getTime()) yesterdayCards.push(card);
    else olderCards.push(card);
  }

  if (todayCards.length) groups.push({ label: "Today", cards: todayCards });
  if (yesterdayCards.length)
    groups.push({ label: "Yesterday", cards: yesterdayCards });
  if (olderCards.length)
    groups.push({ label: "Earlier", cards: olderCards });

  return groups;
}

export default function Home() {
  const grouped = groupCardsByDate(MOCK_MEMORY_CARDS);

  return (
    <div className="min-h-screen bg-[#f5f0e8] font-sans">
      <section className="bg-[#b8e6de]/50 px-4 pt-8 pb-10">
        <AudioRecord />
      </section>

      <section className="px-4 pb-12">
        <div className="mx-auto max-w-2xl">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-bold text-stone-900">Your moments</h2>
          </div>

          <div className="flex flex-col gap-6">
            {grouped.map(({ label, cards }) => (
              <div key={label}>
                <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-stone-700">
                  {label}
                </h3>
                <ul className="flex flex-col gap-3">
                  {cards.map((card) => (
                    <li key={card.id}>
                      <MemoryCard card={card} />
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
