// Server-side safety net: avoid paying Deepgram for near-empty uploads
export const MIN_AUDIO_BYTES = 30000;
