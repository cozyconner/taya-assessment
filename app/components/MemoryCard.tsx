"use client";

import { useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { deleteMemoryCard } from "@/app/actions/memory-card.actions";
import MemoryCardTags from "@/app/components/MemoryCardTags";
import type { MemoryCardDisplay } from "@/types/types";

const LONG_PRESS_MS = 800;

function formatTime(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(date);
}

type MemoryCardProps = {
  card: MemoryCardDisplay;
  onOpenDetail?: () => void;
};

export default function MemoryCard({ card, onOpenDetail }: MemoryCardProps) {
  const router = useRouter();
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pointerLeftRef = useRef(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const clearLongPressTimer = useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  }, []);

  const handlePressStart = useCallback(() => {
    pointerLeftRef.current = false;
    clearLongPressTimer();
    longPressTimer.current = setTimeout(() => {
      longPressTimer.current = null;
      setShowDeleteConfirm(true);
    }, LONG_PRESS_MS);
  }, [clearLongPressTimer]);

  const handlePressEnd = useCallback(() => {
    clearLongPressTimer();
    if (!showDeleteConfirm && !pointerLeftRef.current) {
      onOpenDetail?.();
    }
  }, [clearLongPressTimer, showDeleteConfirm, onOpenDetail]);

  const handlePointerLeave = useCallback(() => {
    pointerLeftRef.current = true;
    clearLongPressTimer();
  }, [clearLongPressTimer]);

  const handleDelete = useCallback(async () => {
    setIsDeleting(true);
    const result = await deleteMemoryCard(card.id);
    setIsDeleting(false);
    setShowDeleteConfirm(false);
    if (result.ok) {
      router.refresh();
    }
  }, [card.id, router]);

  const time = formatTime(new Date(card.createdAt));
  const description =
    card.transcript.length > 120
      ? `${card.transcript.slice(0, 120).trim()}...`
      : card.transcript;

  return (
    <article
      className="relative rounded-2xl border border-stone-200/80 bg-white p-4 shadow-sm transition-shadow hover:shadow-md select-none"
      onMouseDown={handlePressStart}
      onMouseUp={handlePressEnd}
      onMouseLeave={handlePointerLeave}
      onTouchStart={handlePressStart}
      onTouchEnd={handlePressEnd}
      onTouchCancel={handlePressEnd}
      onContextMenu={(e) => e.preventDefault()}
    >
      {showDeleteConfirm ? (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 rounded-2xl bg-stone-900/7 p-4 text-center backdrop-blur-sm">
          <p className="text-sm font-medium text-stone-900">
            Delete this memory?
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setShowDeleteConfirm(false);
              }}
              className="rounded-full bg-stone-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-stone-500"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                void handleDelete();
              }}
              disabled={isDeleting}
              className="rounded-full bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-500 disabled:opacity-50"
            >
              {isDeleting ? "Deleting…" : "Delete"}
            </button>
          </div>
        </div>
      ) : null}

      <div className="flex items-start justify-between gap-3">
        <h3 className="flex-1 text-base font-semibold leading-tight text-stone-900">
          {card.title}
        </h3>
        <div className="flex shrink-0 items-center gap-1.5 text-stone-400">
          <span className="text-sm">{time}</span>
        </div>
      </div>
      <p className="mt-2 text-sm leading-relaxed text-stone-700">
        {description}
      </p>
      {card.actionItems.length > 0 && (
        <p className="mt-1 text-xs text-stone-500">
          {card.actionItems.length}{" "}
          {card.actionItems.length === 1 ? "action item" : "action items"}
        </p>
      )}
      <MemoryCardTags
        mood={card.mood}
        categories={card.categories}
        maxCategories={3}
        className="mt-3"
      />
    </article>
  );
}
