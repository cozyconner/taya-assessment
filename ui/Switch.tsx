"use client";

import { cn } from "@/lib/utils";

type SwitchProps = {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  label?: string;
  "aria-label"?: string;
};

export default function Switch({
  checked,
  onCheckedChange,
  label,
  "aria-label": ariaLabel,
}: SwitchProps) {
  return (
    <label data-id="switchElement" className="flex cursor-pointer items-center gap-2">
      {label != null && (
        <span className="text-sm text-stone-600">{label}</span>
      )}
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={ariaLabel}
        onClick={() => onCheckedChange(!checked)}
        className={cn(
          "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2",
          checked ? "bg-teal-500" : "bg-stone-300"
        )}
      >
        <span
          className={cn(
            "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition",
            checked ? "translate-x-5" : "translate-x-0.5"
          )}
          aria-hidden
        />
      </button>
    </label>
  );
}
