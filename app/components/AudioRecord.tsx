"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createMemoryCardFromAudioAction } from "@/app/actions/memory-card.actions";
import { cn } from "@/lib/utils";
import { useGlobalControls } from "@/stores/useGlobalControls";
import type { AudioRecordState } from "@/types/types";

const OUTER_GLOW_SPREAD = 1.5; // 1.5
const GLOW_BOUNCE_SIZE = 1.2;

const TEAL = {
  light: "rgb(94 234 212 / 0.4)",
  mid: "rgb(45 212 191 / 0.6)",
  dark: "rgb(20 184 166)",
};

/** RMS below this for SILENCE_DURATION_MS = silence detected */
const RMS_SILENCE_THRESHOLD = 0.01;
const SILENCE_DURATION_MS = 2000;
/** Overall average RMS below this = "very quiet" recording (only near-silence) */
const OVERALL_AVG_LOW_THRESHOLD = 0.002;
/** RMS above this = "we're hearing you" */
const SPEECH_DETECTED_THRESHOLD = 0.02;

export default function AudioRecord() {
  const offlineMode = useGlobalControls((s) => s.offlineMode);
  const offlineModeRef = useRef(offlineMode);
  offlineModeRef.current = offlineMode;

  const [recordState, setRecordState] = useState<AudioRecordState>("idle");
  const [transcription, setTranscription] = useState("");
  const [audioLevel, setAudioLevel] = useState(0);
  const [smoothedLevel, setSmoothedLevel] = useState(0);
  const [silenceWarning, setSilenceWarning] = useState<string | null>(null);
  const [recordError, setRecordError] = useState<string | null>(null);

  const smoothedLevelRef = useRef(0);
  const streamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const silenceStartRef = useRef<number | null>(null);
  const rmsHistoryRef = useRef<number[]>([]);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isRecordingRef = useRef(false);
  const silenceAutoStopFiredRef = useRef(false);
  const stopRecordingRef = useRef<() => void>(() => { });
  const router = useRouter();

  const isExpanded = recordState !== "idle";

  useEffect(() => {
    if (isExpanded) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [isExpanded]);

  const stopRecording = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (animationFrameRef.current != null) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (audioContextRef.current?.state !== "closed") {
      audioContextRef.current?.close();
    }
    audioContextRef.current = null;
    analyserRef.current = null;
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
    mediaRecorderRef.current = null;
    setAudioLevel(0);
    setSmoothedLevel(0);
    smoothedLevelRef.current = 0;
    setSilenceWarning(null);
  }, []);

  const startLevelMeter = useCallback((stream: MediaStream) => {
    const ctx = new AudioContext();
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 256;
    analyser.smoothingTimeConstant = 0.5;
    const source = ctx.createMediaStreamSource(stream);
    source.connect(analyser);

    audioContextRef.current = ctx;
    analyserRef.current = analyser;

    const dataArray = new Uint8Array(analyser.frequencyBinCount);

    const computeRMS = () => {
      if (!analyserRef.current || !isRecordingRef.current) return;
      analyserRef.current.getByteTimeDomainData(dataArray);
      let sum = 0;
      for (let i = 0; i < dataArray.length; i++) {
        const n = (dataArray[i] - 128) / 128;
        sum += n * n;
      }
      const rms = Math.sqrt(sum / dataArray.length);
      setAudioLevel(rms);

      const norm = Math.min(1, rms * 8);
      const smoothed = 0.22 * norm + 0.78 * smoothedLevelRef.current;
      smoothedLevelRef.current = smoothed;
      setSmoothedLevel(smoothed);

      rmsHistoryRef.current.push(rms);
      if (rmsHistoryRef.current.length > 120) rmsHistoryRef.current.shift();

      if (rms < RMS_SILENCE_THRESHOLD) {
        const now = Date.now();
        if (silenceStartRef.current == null) silenceStartRef.current = now;
        else if (now - silenceStartRef.current >= SILENCE_DURATION_MS) {
          if (!silenceAutoStopFiredRef.current) {
            silenceAutoStopFiredRef.current = true;
            setSilenceWarning("No sound detected. Stopping recording.");
            isRecordingRef.current = false;
            stopRecordingRef.current();
          }
        }
      } else {
        silenceStartRef.current = null;
      }

      animationFrameRef.current = requestAnimationFrame(computeRMS);
    };

    animationFrameRef.current = requestAnimationFrame(computeRMS);
  }, []);

  const handleToggle = useCallback(async () => {
    if (recordState === "idle") {
      setRecordError(null);
      setSilenceWarning(null);
      silenceStartRef.current = null;
      silenceAutoStopFiredRef.current = false;
      smoothedLevelRef.current = 0;
      setSmoothedLevel(0);
      rmsHistoryRef.current = [];

      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        streamRef.current = stream;

        const recorder = new MediaRecorder(stream);
        chunksRef.current = [];
        recorder.ondataavailable = (e) => {
          if (e.data.size > 0) chunksRef.current.push(e.data);
        };
        recorder.onstop = async () => {
          const blob = new Blob(chunksRef.current, { type: recorder.mimeType || "audio/webm" });
          const avg =
            rmsHistoryRef.current.length > 0
              ? rmsHistoryRef.current.reduce((a, b) => a + b, 0) / rmsHistoryRef.current.length
              : 0;
          const isTooQuiet = avg < OVERALL_AVG_LOW_THRESHOLD;

          if (offlineModeRef.current) {
            setRecordState("done");
            setTranscription("Not saved (listening only)");
            setSilenceWarning(isTooQuiet ? "Recording was very quiet. You may want to record again." : null);
            setTimeout(() => {
              setRecordState("idle");
              setTranscription("");
            }, 1500);
            return;
          }

          if (isTooQuiet) {
            setRecordState("done");
            setSilenceWarning("Recording was too quiet. No audio sent—try again and speak clearly.");
            setTranscription("");
            setTimeout(() => {
              setRecordState("idle");
              setSilenceWarning(null);
            }, 2500);
            return;
          }

          setRecordState("uploading");
          setTranscription("Processing...");

          const formData = new FormData();
          formData.set("audio", blob, "recording.webm");

          const result = await createMemoryCardFromAudioAction(formData);

          if (result.ok) {
            setRecordState("done");
            setTranscription(result.card.title);
            setSilenceWarning(null);
            router.refresh();
            setRecordState("idle");
            setTranscription("");
          } else {
            setRecordState("error");
            setRecordError(result.error);
            setTranscription("");
            setRecordState("idle");
            setRecordError(null);
          }
        };

        recorder.start(100);
        mediaRecorderRef.current = recorder;
        isRecordingRef.current = true;
        setRecordState("recording");

        startLevelMeter(stream);
      } catch (err) {
        isRecordingRef.current = false;
        setRecordError(
          err instanceof Error ? err.message : "Microphone access denied or unavailable."
        );
        setRecordState("idle");
      }
    } else {
      if (recordState === "recording") {
        isRecordingRef.current = false;
        stopRecording();
      } else if (recordState === "done" || recordState === "error") {
        setRecordState("idle");
        setTranscription("");
        setRecordError(null);
      } else {
        isRecordingRef.current = false;
        stopRecording();
        setRecordState("idle");
        setTranscription("");
      }
    }
  }, [recordState, startLevelMeter, stopRecording]);

  useEffect(() => {
    stopRecordingRef.current = stopRecording;
  }, [stopRecording]);

  useEffect(() => {
    return () => stopRecording();
  }, [stopRecording]);

  const normalizedLevel = Math.min(1, audioLevel * 8);
  const displayLevel = recordState === "recording" ? smoothedLevel : normalizedLevel;
  const orbGlow = 12 + displayLevel * 24;
  const isHearingYou = recordState === "recording" && audioLevel >= SPEECH_DETECTED_THRESHOLD;

  return (
    <div
      className={cn(
        "overflow-hidden transition-all duration-500 ease-out",
        isExpanded ? "fixed inset-0 z-20" : "fixed top-0 left-0 right-0 z-20"
      )}
    >
      <div
        className={cn(
          "relative flex flex-col items-center justify-center transition-all duration-500 ease-out",
          isExpanded ? "min-h-screen bg-[#5eead4]/30 backdrop-blur-md" : "min-h-0 py-8"
        )}
        style={
          isExpanded
            ? {
              background: `linear-gradient(180deg, ${TEAL.light} 0%, rgb(94 234 212 / 0.2) 50%, ${TEAL.mid} 100%)`,
            }
            : undefined
        }
      >
        {isExpanded && (
          <div
            className="pointer-events-none absolute inset-0 opacity-30"
            aria-hidden
          >
            <svg className="absolute inset-0 h-full w-full" preserveAspectRatio="none">
              <defs>
                <pattern
                  id="waves"
                  x="0"
                  y="0"
                  width="120"
                  height="40"
                  patternUnits="userSpaceOnUse"
                >
                  <path
                    d="M0 20 Q30 10 60 20 T120 20"
                    fill="none"
                    stroke="white"
                    strokeWidth="1"
                  />
                  <path
                    d="M0 25 Q30 15 60 25 T120 25"
                    fill="none"
                    stroke="white"
                    strokeWidth="1"
                  />
                  <path
                    d="M0 30 Q30 20 60 30 T120 30"
                    fill="none"
                    stroke="white"
                    strokeWidth="1"
                  />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#waves)" />
            </svg>
          </div>
        )}

        {recordError && (
          <div className="relative z-20 mx-4 mt-4 rounded-lg bg-red-100 px-4 py-2 text-sm text-red-800">
            {recordError}
          </div>
        )}

        {isExpanded ? (
          <>
            <div className="relative z-10 flex flex-col items-center justify-center gap-8 px-6">
              <div className="relative rounded-full p-1 w-20 h-20 flex items-center justify-center">
                {recordState === "recording" && (
                  <div
                    className="absolute inset-0 rounded-full pointer-events-none"
                    style={{
                      background: `radial-gradient(circle, ${TEAL.dark} 0%, rgb(20 184 166 / 0.4) 40%, transparent 70%)`,
                      boxShadow: `0 0 ${orbGlow}px ${TEAL.mid}, 0 0 ${orbGlow * OUTER_GLOW_SPREAD}px ${TEAL.light}`,
                      transform: `scale(${1 + displayLevel * GLOW_BOUNCE_SIZE})`,
                      transition: "transform 0.2s ease-out, box-shadow 0.2s ease-out",
                    }}
                    aria-hidden
                  />
                )}
                {recordState !== "recording" && (
                  <div
                    className="absolute inset-0 rounded-full pointer-events-none"
                    style={{
                      background: `radial-gradient(circle, ${TEAL.dark} 0%, rgb(20 184 166 / 0.4) 40%, transparent 70%)`,
                    }}
                    aria-hidden
                  />
                )}
                <button
                  type="button"
                  onClick={handleToggle}
                  disabled={recordState === "uploading" || recordState === "transcribing" || recordState === "synthesizing"}
                  className={cn(
                    "relative flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-teal-500 shadow-lg transition-transform duration-75 hover:scale-105 active:scale-95 disabled:pointer-events-none disabled:cursor-not-allowed disabled:hover:scale-100",
                    (recordState === "uploading" || recordState === "transcribing" || recordState === "synthesizing")
                      ? "animate-[pulse-deep_2s_ease-in-out_infinite]"
                      : "disabled:opacity-70"
                  )}
                  aria-label={
                    recordState === "recording"
                      ? "Stop recording"
                      : recordState === "done" || recordState === "error"
                        ? "Done"
                        : recordState === "uploading" || recordState === "transcribing" || recordState === "synthesizing"
                          ? "Processing"
                          : "Record"
                  }
                >
                  {recordState === "recording" ? (
                    <span className="flex gap-1">
                      <span className="h-6 w-1.5 rounded-full bg-white" />
                      <span className="h-6 w-1.5 rounded-full bg-white" />
                    </span>
                  ) : (
                    <span className="h-5 w-5 rounded-full bg-white" />
                  )}
                </button>
              </div>
              {silenceWarning && (
                <p className="max-w-sm text-center text-sm font-medium text-amber-800">
                  {silenceWarning}
                </p>
              )}
              {(recordState === "error" && recordError) ? (
                <div className="relative w-full max-w-md">
                  <p className="text-center text-lg leading-relaxed text-red-800">{recordError}</p>
                </div>
              ) : null}
            </div>
            {/* {isHearingYou && (
              <div className="absolute bottom-0 left-0 right-0 z-10 flex justify-center pb-8">
                <div
                  className="flex items-center gap-2 rounded-full bg-emerald-500/90 px-4 py-2 text-sm font-medium text-white shadow-md"
                  role="status"
                  aria-live="polite"
                >
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-white" />
                  </span>
                  We're hearing you
                </div>
              </div>
            )} */}
          </>
        ) : (
          <div className="flex flex-col items-center gap-4">
            <div
              className="relative rounded-full p-1"
              style={{
                background: `radial-gradient(circle, ${TEAL.dark} 0%, rgb(20 184 166 / 0.4) 40%, transparent 70%)`,
              }}
            >
              <button
                data-id="audioRecordButton"
                type="button"
                onClick={handleToggle}
                className="relative flex h-16 w-16 items-center justify-center rounded-full bg-teal-500 shadow-md transition-transform hover:scale-105 active:scale-95"
                aria-label="Start recording"
              >
                <span className="h-5 w-5 rounded-full bg-white" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
