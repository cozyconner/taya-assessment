"use client";

import { useRef, useState } from "react";

const TEAL = {
  light: "rgb(94 234 212 / 0.4)",
  mid: "rgb(45 212 191 / 0.6)",
  dark: "rgb(20 184 166)",
};

// 41b9ab9d69aef9b901a2265f388d1a1908aee1c8

export default function AudioRecord() {
  const [isRecording, setIsRecording] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [transcription, setTranscription] = useState("");
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const handleToggle = () => {
    if (!isExpanded) {
      setIsExpanded(true);
      setIsRecording(true);
      setTranscription("");
      const words = [
        "personal for a qu...",
        "God, I love this walk.",
        "Same route every",
      ];
      let i = 0;
      intervalRef.current = setInterval(() => {
        if (i < words.length) {
          setTranscription((prev) => (prev ? `${prev} ${words[i]}` : words[i]));
          i++;
        } else if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      }, 1200);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      setIsRecording(false);
      setIsExpanded(false);
    }
  };

  return (
    <div
      className={`overflow-hidden transition-all duration-500 ease-out ${
        isExpanded ? "fixed inset-0 z-10" : "relative"
      }`}
    >
      <div
        className={`relative flex flex-col items-center justify-center transition-all duration-500 ease-out ${
          isExpanded
            ? "min-h-screen bg-[#5eead4]/30 backdrop-blur-xl"
            : "min-h-0 py-8"
        }`}
        style={
          isExpanded
            ? {
                background: `linear-gradient(180deg, ${TEAL.light} 0%, rgb(94 234 212 / 0.2) 50%, ${TEAL.mid} 100%)`,
              }
            : undefined
        }
      >
        {/* Wavy lines overlay when expanded */}
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

        {isExpanded ? (
          <div className="relative z-10 flex flex-col items-center justify-center gap-8 px-6 pt-12">
            <p className="text-center text-sm font-medium text-teal-800/80">
              Live transcription • Auto-stops after silence
            </p>
            <button
              type="button"
              onClick={handleToggle}
              className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-teal-500 shadow-lg transition-transform hover:scale-105 active:scale-95"
              aria-label={isRecording ? "Stop recording" : "Record"}
            >
              <span className="flex gap-1">
                <span className="h-6 w-1.5 rounded-full bg-white" />
                <span className="h-6 w-1.5 rounded-full bg-white" />
              </span>
            </button>
            <div className="min-h-[4rem] max-w-md text-center">
              <p className="text-lg leading-relaxed text-black">
                {transcription || "Listening..."}
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4">
            <div
              className="relative rounded-full p-1"
              style={{
                background: `radial-gradient(circle, ${TEAL.light} 0%, transparent 70%)`,
              }}
            >
              <button
                type="button"
                onClick={handleToggle}
                className="relative flex h-16 w-16 items-center justify-center rounded-full bg-teal-500 shadow-md transition-transform hover:scale-105 active:scale-95"
                aria-label="Start recording"
              >
                <span className="h-5 w-5 rounded-full bg-white" />
              </button>
            </div>
            <p className="text-sm text-stone-600">Tap to record</p>
          </div>
        )}
      </div>
    </div>
  );
}
