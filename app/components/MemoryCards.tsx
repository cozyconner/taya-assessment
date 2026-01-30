"use client";

import { useState } from "react";
import MemoryCard from "@/app/components/MemoryCard";
import MemoryCardDetailModal from "@/app/components/MemoryCardDetailModal";
import Switch from "@/ui/Switch";
import { useGlobalControls } from "@/stores/useGlobalControls";
import type { MemoryCardDisplay } from "@/types/types";

type Group = { label: string; cards: MemoryCardDisplay[] };

type MemoryCardsProps = {
  groupedMemoryCards: Group[];
};

export default function MemoryCards({ groupedMemoryCards }: MemoryCardsProps) {
  const { offlineMode, setOfflineMode } = useGlobalControls();

  const [selectedCard, setSelectedCard] = useState<MemoryCardDisplay | null>(
    null
  );

  function renderCardList(cards: MemoryCardDisplay[]) {
    return (
      <ul className="flex flex-col gap-3">
        {cards.map((card) => (
          <li key={card.id}>
            <MemoryCard
              card={card}
              onOpenDetail={() => setSelectedCard(card)}
            />
          </li>
        ))}
      </ul>
    );
  }

  return (
    <>
      <section data-id="memoryCardsComponent" className="relative z-0 px-4 pb-12">
        <div className="mx-auto max-w-2xl">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-bold text-stone-900">Your moments</h2>
            <Switch
              checked={offlineMode}
              onCheckedChange={setOfflineMode}
              label="Listening only"
              aria-label={
                offlineMode
                  ? "Listening only (audio not sent)"
                  : "Send audio to server"
              }
            />
          </div>

          <div className="flex flex-col gap-6">
            {groupedMemoryCards.map(({ label, cards }) => (
              <div key={label}>
                <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-stone-700">
                  {label}
                </h3>
                {renderCardList(cards)}
              </div>
            ))}
          </div>
        </div>

      </section>

      {/* MODALS */}
      <MemoryCardDetailModal
        card={selectedCard}
        onClose={() => setSelectedCard(null)}
      />
    </>
  );
}
