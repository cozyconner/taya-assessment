import { create } from "zustand";

import type { MemoryCardDisplay } from "@/types/types";

type OptimisticState = {
  /** Cards created client-side while server is processing. Rendered above server list. */
  cards: MemoryCardDisplay[];
  addCard: (card: MemoryCardDisplay) => void;
  updateCard: (id: string, patch: Partial<MemoryCardDisplay>) => void;
  replaceCardId: (oldId: string, newId: string) => void;
  removeCard: (id: string) => void;
  clear: () => void;
};

export const useOptimisticMemoryCards = create<OptimisticState>((set) => ({
  cards: [],
  addCard: (card) =>
    set((s) => ({
      cards: [card, ...s.cards],
    })),
  updateCard: (id, patch) =>
    set((s) => ({
      cards: s.cards.map((c) => (c.id === id ? { ...c, ...patch } : c)),
    })),
  replaceCardId: (oldId, newId) =>
    set((s) => ({
      cards: s.cards.map((c) => (c.id === oldId ? { ...c, id: newId } : c)),
    })),
  removeCard: (id) =>
    set((s) => ({
      cards: s.cards.filter((c) => c.id !== id),
    })),
  clear: () => set({ cards: [] }),
}));
