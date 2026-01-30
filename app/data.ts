import type { MemoryCardDisplay } from "@/types/types";

export const MOCK_MEMORY_CARDS: MemoryCardDisplay[] = [
  {
    id: "1",
    createdAt: new Date(new Date().setHours(9, 41, 0)),
    title: "Founders Discussing Chat Experience",
    transcript:
      "Two founders discuss designing an elegant chat experience that helps users reconnect with loved ones and share moments more naturally.",
    mood: "inspired",
    categories: ["work", "ideas"],
    actionItems: [],
  },
  {
    id: "2",
    createdAt: new Date(new Date().setHours(7, 30, 0)),
    title: "Mother-Daughter Weekend Planning",
    transcript:
      "Planning a weekend trip together, deciding on activities and places to eat. Lots of laughter and excitement about the upcoming adventure.",
    mood: "excited",
    categories: ["personal", "family"],
    actionItems: ["Book restaurant", "Check weather"],
  },
  {
    id: "3",
    createdAt: new Date(Date.now() - 86400000),
    title: "Late-night talk with a friend about",
    transcript:
      "A long conversation about life goals and what matters most. Reflecting on the past year and setting intentions for the next.",
    mood: "reflective",
    categories: ["personal"],
    actionItems: [],
  },
];
