import type { MemoryCardDisplay } from "@/types/types";

/** Kept for possible reuse (e.g. demos, fallback UI). Not used when loading from API. */
export const MOCK_MEMORY_CARDS: MemoryCardDisplay[] = [
  {
    id: "1",
    createdAt: new Date("2026-01-30T09:41:00Z"),
    updatedAt: new Date("2026-01-30T09:41:00Z"),
    userId: null,
    title: "Founders Discussing Chat Experience",
    transcript:
      "Two founders discuss designing an elegant chat experience that helps users reconnect with loved ones and share moments more naturally.",
    mood: "inspired",
    categories: ["work", "ideas"],
    actionItems: [],
    raw: null,
  },
  {
    id: "2",
    createdAt: new Date("2026-01-30T07:30:00Z"),
    updatedAt: new Date("2026-01-30T07:30:00Z"),
    userId: null,
    title: "Mother-Daughter Weekend Planning",
    transcript:
      "Planning a weekend trip together, deciding on activities and places to eat. Lots of laughter and excitement about the upcoming adventure.",
    mood: "excited",
    categories: ["personal", "family"],
    actionItems: ["Book restaurant", "Check weather"],
    raw: null,
  },
  {
    id: "3",
    createdAt: new Date("2026-01-29T22:00:00Z"),
    updatedAt: new Date("2026-01-29T22:00:00Z"),
    userId: null,
    title: "Late-night talk with a friend about",
    transcript:
      "A long conversation about life goals and what matters most. Reflecting on the past year and setting intentions for the next.",
    mood: "reflective",
    categories: ["personal"],
    actionItems: [],
    raw: null,
  },
  {
    id: "4",
    createdAt: new Date("2026-01-30T14:15:00Z"),
    updatedAt: new Date("2026-01-30T14:15:00Z"),
    userId: null,
    title: "Morning Coffee and Product Ideas",
    transcript:
      "Brainstorming new features over coffee. Discussed notification preferences and how to make the onboarding flow feel less overwhelming.",
    mood: "hopeful",
    categories: ["work", "ideas", "product"],
    actionItems: ["Draft notification spec", "Sketch onboarding flow"],
    raw: null,
  },
  {
    id: "5",
    createdAt: new Date("2026-01-30T11:00:00Z"),
    updatedAt: new Date("2026-01-30T11:00:00Z"),
    userId: null,
    title: "Gratitude and Weekend Recap",
    transcript:
      "Talking through the best parts of the weekend—hiking, dinner with family, and finally finishing that book. Feeling grateful for the small moments.",
    mood: "grateful",
    categories: ["personal", "family"],
    actionItems: [],
    raw: null,
  },
  {
    id: "6",
    createdAt: new Date("2026-01-28T10:00:00Z"),
    updatedAt: new Date("2026-01-28T10:00:00Z"),
    userId: null,
    title: "Design Feedback Session",
    transcript:
      "Walked through the new dashboard mockups with the team. Mixed feelings about the timeline but good energy in the room. Need to prioritize accessibility.",
    mood: "pensive",
    categories: ["work", "design"],
    actionItems: ["Update contrast ratios", "Schedule follow-up"],
    raw: null,
  },
  {
    id: "7",
    createdAt: new Date("2026-01-28T15:00:00Z"),
    updatedAt: new Date("2026-01-28T15:00:00Z"),
    userId: null,
    title: "Quick Catch-up with Sibling",
    transcript:
      "Short call to plan the holiday visit. Decided on dates and who's hosting. Everyone seems relaxed about it this year.",
    mood: "relaxed",
    categories: ["personal", "family"],
    actionItems: ["Book flights", "Confirm dates"],
    raw: null,
  },
  {
    id: "8",
    createdAt: new Date("2026-01-27T09:00:00Z"),
    updatedAt: new Date("2026-01-27T09:00:00Z"),
    userId: null,
    title: "Project Timeline Concerns",
    transcript:
      "Reviewing the sprint and realizing we're behind. Frustrated with the blockers but trying to focus on what we can control. Need to communicate delays to stakeholders.",
    mood: "frustrated",
    categories: ["work"],
    actionItems: ["Send status update", "Identify top 3 blockers"],
    raw: null,
  },
];
