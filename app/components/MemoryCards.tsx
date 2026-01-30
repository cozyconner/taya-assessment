"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import MemoryCard from "@/app/components/MemoryCard";
import MemoryCardDetailModal from "@/app/components/MemoryCardDetailModal";
import Switch from "@/ui/Switch";
import { useGlobalControls } from "@/stores/useGlobalControls";
import { useOptimisticMemoryCards } from "@/stores/useOptimisticMemoryCards";
import type { MemoryCardDisplay } from "@/types/types";

export type GroupedMemoryCards = { label: string; cards: MemoryCardDisplay[] };

type MemoryCardsProps = {
  groupedMemoryCards: GroupedMemoryCards[];
};

export default function MemoryCards({ groupedMemoryCards }: MemoryCardsProps) {
  const { offlineMode, setOfflineMode } = useGlobalControls();
  const optimisticCards = useOptimisticMemoryCards((s) => s.cards);
  const searchParams = useSearchParams();

  const isAdmin = searchParams.get("admin") === "1";

  const [selectedCard, setSelectedCard] = useState<MemoryCardDisplay | null>(null);

  const hasCards =
    groupedMemoryCards.length > 0 &&
    groupedMemoryCards.some((group) => group.cards.length > 0);

  const hasOptimistic = optimisticCards.length > 0;

  const groupsWithOptimistic: GroupedMemoryCards[] = (() => {
    if (!hasOptimistic) return groupedMemoryCards;

    const optimisticIdSet = new Set(optimisticCards.map((c) => c.id));
    const dedupedGroups = groupedMemoryCards.map((g) => ({
      ...g,
      cards: g.cards.filter((c) => !optimisticIdSet.has(c.id)),
    }));

    const idxToday = dedupedGroups.findIndex((g) => g.label === "Today");

    if (idxToday >= 0) {
      const today = dedupedGroups[idxToday];
      const mergedToday: GroupedMemoryCards = {
        ...today,
        cards: [...optimisticCards, ...today.cards],
      };
      return [
        ...dedupedGroups.slice(0, idxToday),
        mergedToday,
        ...dedupedGroups.slice(idxToday + 1),
      ];
    }

    return [{ label: "Today", cards: optimisticCards }, ...dedupedGroups];
  })();

  function renderCardList(cards: MemoryCardDisplay[]) {
    return (
      <ul className="flex flex-col gap-3">
        {cards.map((card) => (
          <li key={card.id}>
            <MemoryCard
              card={card}
              onOpenDetail={card.uiState ? undefined : () => setSelectedCard(card)}
            />
          </li>
        ))}
      </ul>
    );
  }

  function renderAdminSwitch() {
    if (!isAdmin) return null;
    return (
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
    );
  }

  function renderMemoryCards() {
    if (hasCards || hasOptimistic) {
      return (
        <div className="flex flex-col gap-6">
          {groupsWithOptimistic.map(({ label, cards }) => (
            <div key={label}>
              <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-stone-700">
                {label}
              </h3>
              {renderCardList(cards)}
            </div>
          ))}
        </div>
      );
    }

    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-center text-lg font-medium text-stone-700">
          Create your first memory card
        </p>
      </div>
    );
  }

  return (
    <>
      <section data-id="memoryCardsComponent" className="relative z-0 px-4 pb-12">
        <div className="mx-auto max-w-2xl">
          <div className="mb-4 flex items-center justify-between">
            {hasCards || hasOptimistic ? (
              <h2 className="text-xl font-bold text-stone-900">Your moments</h2>
            ) : (
              null
            )}
            {renderAdminSwitch()}
          </div>

          {renderMemoryCards()}
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
