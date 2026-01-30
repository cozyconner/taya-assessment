"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createMemoryCardFromAudioAction } from "@/app/actions/memory-card.actions";
import { MOCK_MEMORY_CARDS } from "@/app/data/data";
import { TEAL } from "@/lib/colors";
import { cn } from "@/lib/utils";
import { useAudioRecorderStore, type AudioStopResult } from "@/stores/useAudioRecorder";
import { useGlobalControls } from "@/stores/useGlobalControls";
import { useOptimisticMemoryCards } from "@/stores/useOptimisticMemoryCards";
import type { AudioRecordState } from "@/types/types";

const OUTER_GLOW_SPREAD = 1.5;
const GLOW_BOUNCE_SIZE = 1.2;

export default function AudioRecordButton() {
  const offlineMode = useGlobalControls((s) => s.offlineMode);
  const offlineModeRef = useRef(offlineMode);
  useEffect(() => {
    offlineModeRef.current = offlineMode;
  }, [offlineMode]);

  const addOptimisticCard = useOptimisticMemoryCards((s) => s.addCard);
  const updateOptimisticCard = useOptimisticMemoryCards((s) => s.updateCard);
  const replaceOptimisticCardId = useOptimisticMemoryCards((s) => s.replaceCardId);

  const [flowState, setFlowState] = useState<AudioRecordState>("idle");
  const router = useRouter();

  const isRecording = useAudioRecorderStore((s) => s.isRecording);
  const audioLevel = useAudioRecorderStore((s) => s.audioLevelRms);
  const smoothedLevel = useAudioRecorderStore((s) => s.smoothedLevel);
  const recordError = useAudioRecorderStore((s) => s.error);
  const clearError = useAudioRecorderStore((s) => s.clearError);
  const startRecording = useAudioRecorderStore((s) => s.startRecording);
  const stopRecording = useAudioRecorderStore((s) => s.stopRecording);

  const handleStop = useCallback(
    async ({ blob, isEmptyOrTooShort, isTooQuiet }: AudioStopResult) => {
      if (offlineModeRef.current) return;
      if (isEmptyOrTooShort) return;
      if (isTooQuiet) return;

      const base = MOCK_MEMORY_CARDS[Math.floor(Math.random() * MOCK_MEMORY_CARDS.length)];

      const uuid =
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

      const optimisticId = `optimistic-${uuid}`;

      addOptimisticCard({
        ...base,
        id: optimisticId,
        createdAt: new Date(),
        uiState: "pending",
        uiError: undefined,
      });

      const formData = new FormData();
      formData.set("audio", blob, "recording.webm");

      try {
        const result = await createMemoryCardFromAudioAction(formData);

        if (result.ok) {
          // Update in-place to show real content, then fade overlay off.
          updateOptimisticCard(optimisticId, {
            title: result.card.title,
            transcript: result.card.transcript,
            mood: result.card.mood,
            categories: result.card.categories,
            actionItems: result.card.actionItems,
            createdAt: new Date(result.card.createdAt),
            uiState: "done",
            uiError: undefined,
          });

          // Swap the optimistic id to the real server id so the card stays in-place
          // (prevents "flash" where we remove then re-add after refresh).
          const serverId = result.card.id;
          replaceOptimisticCardId(optimisticId, serverId);

          // After the fade completes, remove the overlay entirely so the card behaves normally.
          setTimeout(() => {
            updateOptimisticCard(serverId, { uiState: undefined, uiError: undefined });
          }, 350);

          // Refresh in the background to keep server-rendered data in sync.
          // Server card is deduped by id while the optimistic one exists.
          router.refresh();
        } else {
          updateOptimisticCard(optimisticId, {
            uiState: "error",
            uiError: result.error,
          });
        }
      } catch (err) {
        updateOptimisticCard(optimisticId, {
          uiState: "error",
          uiError: err instanceof Error ? err.message : "Something went wrong.",
        });
      }
    },
    [addOptimisticCard, replaceOptimisticCardId, router, updateOptimisticCard]
  );

  const recordState: AudioRecordState = isRecording ? "recording" : flowState;
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

  const handleToggleRecord = useCallback(async () => {
    if (recordState === "idle") {
      clearError();
      const ok = await startRecording({ onStop: handleStop });
      if (!ok) setFlowState("idle");
    } else {
      if (recordState === "recording") {
        stopRecording();
      } else if (recordState === "done" || recordState === "error") {
        setFlowState("idle");
        clearError();
      } else {
        stopRecording();
        setFlowState("idle");
      }
    }
  }, [clearError, handleStop, recordState, startRecording, stopRecording]);

  const normalizedLevel = Math.min(1, audioLevel * 8);
  const displayLevel = recordState === "recording" ? smoothedLevel : normalizedLevel;
  const orbGlow = 12 + displayLevel * 24;

  return (
    <div
      data-id="audioRecordButtonComponent"
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
                  onClick={handleToggleRecord}
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
                    <span className="h-5 w-5 rounded-sm bg-white" />
                  ) : (
                    <span className="h-5 w-5 rounded-full bg-white" />
                  )}
                </button>
              </div>
              {(recordState === "error" && recordError) ? (
                <div className="relative w-full max-w-md">
                  <p className="text-center text-lg leading-relaxed text-red-800">{recordError}</p>
                </div>
              ) : null}
            </div>
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
                onClick={handleToggleRecord}
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
