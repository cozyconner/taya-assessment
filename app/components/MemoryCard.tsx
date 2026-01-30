import type { MemoryCardDisplay } from "@/types/types";

function formatTime(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(date);
}

function formatMood(mood: string): string {
  return mood.charAt(0).toUpperCase() + mood.slice(1).toLowerCase();
}

export default function MemoryCard({ card }: { card: MemoryCardDisplay }) {
  const time = formatTime(new Date(card.createdAt));
  const description =
    card.transcript.length > 120
      ? `${card.transcript.slice(0, 120).trim()}...`
      : card.transcript;

  return (
    <article className="rounded-2xl border border-stone-200/80 bg-white p-4 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <h3 className="flex-1 text-base font-semibold leading-tight text-stone-900">
          {card.title}
        </h3>
        <div className="flex shrink-0 items-center gap-1.5 text-stone-400">
          <span className="text-sm">{time}</span>
          <svg
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        </div>
      </div>
      <p className="mt-2 text-sm leading-relaxed text-stone-700">
        {description}
      </p>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-teal-50 px-2.5 py-0.5 text-xs font-medium text-teal-700">
          {formatMood(card.mood)}
        </span>
        {card.categories.length > 0 &&
          card.categories.slice(0, 3).map((cat) => (
            <span
              key={cat}
              className="rounded-full bg-stone-100 px-2.5 py-0.5 text-xs text-stone-600"
            >
              {cat}
            </span>
          ))}
      </div>
    </article>
  );
}
