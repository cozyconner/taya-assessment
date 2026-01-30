"use client";

import { useEffect, useCallback, useState } from "react";
import MemoryCardTags from "@/app/components/MemoryCardTags";
import type { MemoryCardDisplay } from "@/types/types";

const DURATION_MS = 200;

function formatTime(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(date);
}

type MemoryCardDetailProps = {
  card: MemoryCardDisplay;
  onClose: () => void;
};

export default function MemoryCardDetail({ card, onClose }: MemoryCardDetailProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  const handleClose = useCallback(() => {
    if (isClosing) return;
    setIsClosing(true);
    setTimeout(() => onClose(), DURATION_MS);
  }, [onClose, isClosing]);

  const handleEscape = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    },
    [handleClose]
  );

  useEffect(() => {
    const t = requestAnimationFrame(() => setIsVisible(true));
    return () => cancelAnimationFrame(t);
  }, []);

  useEffect(() => {
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [handleEscape]);

  const time = formatTime(new Date(card.createdAt));

  const backdropOpacity = isVisible && !isClosing ? "opacity-100" : "opacity-0";
  const panelOpacity = isVisible && !isClosing ? "opacity-100 scale-100" : "opacity-0 scale-95";

  function renderActionItems(actionItems: string[]) {
    return (
      <ul className="mt-2 list-outside list-disc space-y-1 pl-4 pr-0 text-sm text-stone-700 [&_li::marker]:text-stone-500">
        {actionItems.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ul>
    );
  }

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/15 backdrop-blur-sm transition-opacity duration-200 ease-out ${backdropOpacity}`}
      aria-modal
      aria-labelledby="memory-detail-title"
      role="dialog"
    >
      <button
        type="button"
        onClick={handleClose}
        className="absolute inset-0 z-0"
        aria-label="Close"
      />
      <div
        className={`relative z-10 w-full max-w-lg rounded-2xl border border-stone-200/80 bg-white p-6 shadow-xl transition-all duration-200 ease-out ${panelOpacity}`}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={handleClose}
          className="absolute right-4 top-4 rounded-full p-1.5 text-stone-400 transition-colors hover:bg-stone-100 hover:text-stone-600"
          aria-label="Close"
        >
          <svg
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        <div className="pr-8">
          <h2
            id="memory-detail-title"
            className="text-lg font-semibold leading-tight text-stone-900"
          >
            {card.title}
          </h2>
          <p className="mt-1 text-sm text-stone-500">{time}</p>
        </div>

        <p className="mt-4 text-sm leading-relaxed text-stone-700">
          {card.transcript}
        </p>

        <MemoryCardTags
          mood={card.mood}
          categories={card.categories}
          className="mt-4"
        />

        {card.actionItems.length > 0 && (
          <div className="mt-4">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-stone-500">
              Action items
            </h3>
            {renderActionItems(card.actionItems)}
          </div>
        )}
      </div>
    </div>
  );
}
