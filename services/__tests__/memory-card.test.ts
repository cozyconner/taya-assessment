import { describe, it, expect, vi, beforeEach } from "vitest";
import { generateMemoryCard, MemoryCardOutputSchema } from "../memory-card.service";

const mockOpenAIResponse = {
  title: "Team sync",
  mood: "content",
  categories: ["work"],
  actionItems: ["Schedule follow-up"],
};

vi.mock("openai", () => {
  const response = {
    title: "Team sync",
    mood: "content",
    categories: ["work"],
    actionItems: ["Schedule follow-up"],
  };
  return {
    default: class MockOpenAI {
      chat = {
        completions: {
          create: vi.fn().mockResolvedValue({
            choices: [{ message: { content: JSON.stringify(response) } }],
          }),
        },
      };
    },
  };
});

describe("memory-card", () => {
  beforeEach(() => {
    process.env.OPENAI_API_KEY = "test-key";
  });

  describe("MemoryCardOutputSchema", () => {
    it("parses valid output", () => {
      const raw = {
        title: "Morning standup",
        mood: "hopeful",
        categories: ["work"],
        actionItems: ["Send status update", "Review PR"],
      };
      const result = MemoryCardOutputSchema.parse(raw);
      expect(result.title).toBe("Morning standup");
      expect(result.mood).toBe("hopeful");
      expect(result.categories).toEqual(["work"]);
      expect(result.actionItems).toEqual(["Send status update", "Review PR"]);
    });

    it("trims and filters empty action items", () => {
      const raw = {
        title: "Test",
        mood: "reflective",
        categories: ["other"],
        actionItems: ["  Do something  ", "", "  ", "Another"],
      };
      const result = MemoryCardOutputSchema.parse(raw);
      expect(result.actionItems).toEqual(["Do something", "Another"]);
    });

    it("rejects invalid mood", () => {
      const raw = {
        title: "Test",
        mood: "invalid",
        categories: [],
        actionItems: [],
      };
      expect(() => MemoryCardOutputSchema.parse(raw)).toThrow();
    });
  });

  describe("generateMemoryCard", () => {
    it("returns parsed output from OpenAI", async () => {
      const result = await generateMemoryCard("Some transcript from a meeting.");
      expect(result.title).toBe(mockOpenAIResponse.title);
      expect(result.mood).toBe(mockOpenAIResponse.mood);
      expect(result.categories).toEqual(mockOpenAIResponse.categories);
      expect(result.actionItems).toEqual(mockOpenAIResponse.actionItems);
    });

    it("throws when OPENAI_API_KEY is not set", async () => {
      const orig = process.env.OPENAI_API_KEY;
      delete process.env.OPENAI_API_KEY;
      await expect(
        generateMemoryCard("Transcript")
      ).rejects.toThrow("OPENAI_API_KEY is not set");
      process.env.OPENAI_API_KEY = orig;
    });
  });
});
