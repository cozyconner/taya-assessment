"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { deleteMemoryCardAction } from "@/app/actions/memory-card.actions";
import MemoryCardTags from "@/app/components/MemoryCardTags";
import { useOptimisticMemoryCards } from "@/stores/useOptimisticMemoryCards";
import MenuButton from "@/ui/MenuButton";
import type { MemoryCardDisplay } from "@/types/types";
import { cn, formatTimeLong, formatTimeShort } from "@/lib/utils";

const DURATION_MS = 200;

type MemoryCardProps = {
  card: MemoryCardDisplay;
  onOpenDetail?: () => void;
  isDetail?: boolean;
  onClose?: () => void;
};

export default function MemoryCard({
  card,
  onOpenDetail,
  isDetail = false,
  onClose,
}: MemoryCardProps) {
  const router = useRouter();
  const menuRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const removeOptimisticCard = useOptimisticMemoryCards((s) => s.removeCard);

  const handleClose = useCallback(() => {
    if (isClosing) {
      return;
    }
    setIsClosing(true);
    setTimeout(() => onClose?.(), DURATION_MS);
  }, [isClosing, onClose]);

  async function handleDelete() {
    setIsDeleting(true);
    const result = await deleteMemoryCardAction({ id: card.id });
    setIsDeleting(false);
    setMenuOpen(false);
    if (result.ok) {
      // If this card exists in the optimistic client store (newly created),
      // router.refresh() won't remove it. Explicitly remove it here.
      removeOptimisticCard(card.id);
      if (isDetail && onClose) {
        handleClose();
      }

      router.refresh();
    }
  }

  useEffect(() => {
    if (!isDetail) return;
    const t = requestAnimationFrame(() => setIsVisible(true));
    return () => cancelAnimationFrame(t);
  }, [isDetail]);

  useEffect(() => {
    if (!menuOpen) return;
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  const timeShort = formatTimeShort(new Date(card.createdAt));
  const timeLong = formatTimeLong(new Date(card.createdAt));
  const description =
    card.transcript.length > 120
      ? `${card.transcript.slice(0, 120).trim()}...`
      : card.transcript;

  const showOverlay = Boolean(card.uiState);
  const overlayVisible = card.uiState === "pending" || card.uiState === "error";

  function renderActionItems(actionItems: string[]) {
    return (
      <ul className="mt-2 list-outside list-disc space-y-1 pl-4 pr-0 text-sm text-stone-700 [&_li::marker]:text-stone-500">
        {actionItems.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ul>
    );
  }

  const threeDotsMenu = (
    <div ref={menuRef} className="relative z-20">
      <MenuButton
        expanded={menuOpen}
        onClick={(e) => {
          e.stopPropagation();
          setMenuOpen((open) => !open);
        }}
      />
      {menuOpen && (
        <div className="absolute right-0 top-full mt-1 min-w-[120px] rounded-lg border border-stone-200 bg-white py-1 shadow-lg">
          <button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting}
            className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-stone-50 disabled:opacity-50"
          >
            {isDeleting ? "Deleting…" : "Delete"}
          </button>
          <button
            type="button"
            onClick={() => setMenuOpen(false)}
            className="w-full px-3 py-2 text-left text-sm text-stone-700 hover:bg-stone-50"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );

  if (isDetail) {
    const backdropOpacity = isVisible && !isClosing ? "opacity-100" : "opacity-0";
    const panelOpacity = isVisible && !isClosing ? "opacity-100 scale-100" : "opacity-0 scale-95";

    return (
      <div
        data-id="memoryCardComponent"
        className={cn(
          "fixed inset-0 z-50 overflow-y-auto bg-stone-900/15 backdrop-blur-sm transition-opacity duration-200 ease-out",
          backdropOpacity
        )}
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
        <div className="min-h-full flex items-center justify-center p-4">
          <div
            className={cn(
              "relative z-10 w-full max-w-lg rounded-2xl border border-stone-200/80 bg-white p-6 shadow-xl transition-all duration-200 ease-out",
              panelOpacity
            )}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="absolute right-4 top-4 z-20">
              {threeDotsMenu}
            </div>
            <div className="pr-8">
              <h2
                id="memory-detail-title"
                className="text-lg font-semibold leading-tight text-stone-900"
              >
                {card.title}
              </h2>
              <p className="mt-1 text-sm text-stone-500">{timeLong}</p>
            </div>

            <p className="mt-3 text-sm leading-relaxed text-stone-700">
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

            <div className="mt-3 flex justify-end">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 text-sm font-medium text-white bg-teal-500 rounded-[200px] hover:bg-teal-700 transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <article
      className={cn(
        "relative rounded-2xl border border-stone-200/80 bg-white p-4 shadow-sm transition-shadow",
        onOpenDetail ? "cursor-pointer hover:shadow-md" : "cursor-default"
      )}
      onClick={onOpenDetail}
      role={onOpenDetail ? "button" : undefined}
    >
      {showOverlay && (
        <div
          className={cn(
            "absolute inset-0 z-10 rounded-2xl bg-white/35 backdrop-blur-sm transition-opacity duration-300",
            overlayVisible ? "opacity-100" : "pointer-events-none opacity-0"
          )}
          aria-hidden={!overlayVisible}
        >
          <div className="flex h-full w-full items-center justify-center">
            {card.uiState === "error" ? (
              <div className="mx-6 rounded-xl border border-red-200 bg-white/70 px-4 py-3 text-center shadow-sm">
                <p className="text-sm font-semibold text-red-700">Processing failed</p>
                <p className="mt-1 text-xs text-red-700/90">
                  {card.uiError ?? "Please try again."}
                </p>
                <button
                  type="button"
                  className="mt-3 rounded-full bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700"
                  onClick={() => removeOptimisticCard(card.id)}
                >
                  Dismiss
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3">
                <div
                  className="h-10 w-10 animate-spin rounded-full border-2 border-white/80 border-t-teal-600"
                  aria-label="Loading"
                />
                <p className="text-xs font-medium text-stone-700">Organizing your thoughts...</p>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="flex items-start justify-between gap-3">
        <h3 className="min-w-0 flex-1 text-base font-semibold leading-tight text-stone-900">
          {card.title}
        </h3>
        <span className="shrink-0 text-sm text-stone-400">{timeShort}</span>
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
