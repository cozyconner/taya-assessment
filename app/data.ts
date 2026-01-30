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
  {
    id: "4",
    createdAt: new Date(new Date().setHours(14, 15, 0)),
    title: "Morning Coffee and Product Ideas",
    transcript:
      "Brainstorming new features over coffee. Discussed notification preferences and how to make the onboarding flow feel less overwhelming.",
    mood: "hopeful",
    categories: ["work", "ideas", "product"],
    actionItems: ["Draft notification spec", "Sketch onboarding flow"],
  },
  {
    id: "5",
    createdAt: new Date(new Date().setHours(11, 0, 0)),
    title: "Gratitude and Weekend Recap",
    transcript:
      "Talking through the best parts of the weekend—hiking, dinner with family, and finally finishing that book. Feeling grateful for the small moments.",
    mood: "grateful",
    categories: ["personal", "family"],
    actionItems: [],
  },
  {
    id: "6",
    createdAt: new Date(Date.now() - 86400000 * 2),
    title: "Design Feedback Session",
    transcript:
      "Walked through the new dashboard mockups with the team. Mixed feelings about the timeline but good energy in the room. Need to prioritize accessibility.",
    mood: "pensive",
    categories: ["work", "design"],
    actionItems: ["Update contrast ratios", "Schedule follow-up"],
  },
  {
    id: "7",
    createdAt: new Date(Date.now() - 86400000 * 2),
    title: "Quick Catch-up with Sibling",
    transcript:
      "Short call to plan the holiday visit. Decided on dates and who's hosting. Everyone seems relaxed about it this year.",
    mood: "relaxed",
    categories: ["personal", "family"],
    actionItems: ["Book flights", "Confirm dates"],
  },
  {
    id: "8",
    createdAt: new Date(Date.now() - 86400000 * 3),
    title: "Project Timeline Concerns",
    transcript:
      "Reviewing the sprint and realizing we're behind. Frustrated with the blockers but trying to focus on what we can control. Need to communicate delays to stakeholders.",
    mood: "frustrated",
    categories: ["work"],
    actionItems: ["Send status update", "Identify top 3 blockers"],
  },
];
