/**
 * Transcribe audio using Deepgram.
 * Used by API route and actions; testable in isolation.
 */

const DEEPGRAM_BASE = "https://api.deepgram.com/v1/listen";
const MIN_TRANSCRIPT_LENGTH = 2;

export interface TranscribeResult {
  transcript: string;
}

/**
 * Sends audio bytes to Deepgram and returns the transcript.
 * @param audioBuffer - Raw audio bytes (e.g. from Blob.arrayBuffer() or multipart)
 * @param mimeType - Optional MIME type (e.g. "audio/webm") for Content-Type
 */
export async function transcribeAudio_service(
  audioBuffer: ArrayBuffer,
  mimeType: string = "audio/webm"
): Promise<TranscribeResult> {
  const apiKey = process.env.DEEPGRAM_API_KEY;
  if (!apiKey) {
    throw new Error("DEEPGRAM_API_KEY is not set");
  }

  const url = `${DEEPGRAM_BASE}?model=nova-2&smart_format=true`;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Token ${apiKey}`,
      "Content-Type": mimeType,
    },
    body: audioBuffer,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Deepgram request failed: ${response.status} ${text}`);
  }

  const data = (await response.json()) as {
    results?: { channels?: Array<{ alternatives?: Array<{ transcript?: string }> }> };
  };

  const transcript =
    data.results?.channels?.[0]?.alternatives?.[0]?.transcript?.trim() ?? "";

  return { transcript };
}

/**
 * Returns true if the transcript is considered too short (silence / no speech).
 */
export function isTranscriptTooShort_service(transcript: string): boolean {
  return transcript.length < MIN_TRANSCRIPT_LENGTH;
}
