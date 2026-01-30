import { describe, it, expect, vi, beforeEach } from "vitest";
import { transcribeAudio_service, isTranscriptTooShort_service } from "../transcribe.service";

describe("transcribe", () => {
  beforeEach(() => {
    process.env.DEEPGRAM_API_KEY = "test-key";
  });

  describe("transcribeAudio_service", () => {
    it("returns transcript from Deepgram response", async () => {
      const mockTranscript = "Hello, this is a test.";
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            results: {
              channels: [
                {
                  alternatives: [{ transcript: mockTranscript }],
                },
              ],
            },
          }),
      });
      vi.stubGlobal("fetch", mockFetch);

      const result = await transcribeAudio_service(new ArrayBuffer(8), "audio/webm");

      expect(result.transcript).toBe(mockTranscript);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("api.deepgram.com"),
        expect.objectContaining({
          method: "POST",
          headers: expect.objectContaining({
            Authorization: "Token test-key",
            "Content-Type": "audio/webm",
          }),
        })
      );
    });

    it("returns empty string when Deepgram returns no transcript", async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ results: { channels: [{}] } }),
      });
      vi.stubGlobal("fetch", mockFetch);

      const result = await transcribeAudio_service(new ArrayBuffer(8));

      expect(result.transcript).toBe("");
    });

    it("throws when DEEPGRAM_API_KEY is not set", async () => {
      const key = process.env.DEEPGRAM_API_KEY;
      delete process.env.DEEPGRAM_API_KEY;

      await expect(transcribeAudio_service(new ArrayBuffer(8))).rejects.toThrow(
        "DEEPGRAM_API_KEY is not set"
      );

      process.env.DEEPGRAM_API_KEY = key ?? "";
    });
  });

  describe("isTranscriptTooShort_service", () => {
    it("returns true for empty string", () => {
      expect(isTranscriptTooShort_service("")).toBe(true);
    });

    it("returns true for single character", () => {
      expect(isTranscriptTooShort_service("a")).toBe(true);
    });

    it("returns false for two or more characters", () => {
      expect(isTranscriptTooShort_service("ab")).toBe(false);
      expect(isTranscriptTooShort_service("Hello world")).toBe(false);
    });
  });
});
