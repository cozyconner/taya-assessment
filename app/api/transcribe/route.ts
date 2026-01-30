import { NextResponse } from "next/server";
import { transcribeAudio_service, isTranscriptTooShort_service } from "@/services/transcribe.service";

const FRIENDLY_SILENCE_MESSAGE = "Couldn't hear audio. Please try again and speak clearly.";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const audio = formData.get("audio");

    if (!audio || !(audio instanceof Blob)) {
      return NextResponse.json(
        { error: "Missing or invalid audio file" },
        { status: 400 }
      );
    }

    const mimeType = audio.type || "audio/webm";
    const buffer = await audio.arrayBuffer();

    if (buffer.byteLength === 0) {
      return NextResponse.json(
        { error: FRIENDLY_SILENCE_MESSAGE },
        { status: 422 }
      );
    }

    const { transcript } = await transcribeAudio_service(buffer, mimeType);

    if (isTranscriptTooShort_service(transcript)) {
      return NextResponse.json(
        { error: FRIENDLY_SILENCE_MESSAGE },
        { status: 422 }
      );
    }

    return NextResponse.json({ transcript });
  } catch (err) {
    console.error("Transcribe API error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Transcription failed" },
      { status: 500 }
    );
  }
}
