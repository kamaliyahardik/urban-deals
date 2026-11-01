"use client";

import React from "react";
import { Sparkles, Flame, Snowflake } from "lucide-react";

export const HOME_SECTIONS = [
  {
    key: "hero",
    label: "Hero showcase",
    Icon: Sparkles,
    hint: "Floating photo cards in the homepage hero",
  },
  {
    key: "trending",
    label: "Trending deals",
    Icon: Flame,
    hint: '"Highest-rated, right now" section',
  },
  {
    key: "fresh",
    label: "Fresh drops",
    Icon: Snowflake,
    hint: '"Recently added deals" section',
  },
] as const;

type SectionKey = (typeof HOME_SECTIONS)[number]["key"];

/**
 * Real switch toggles (track + knob) — one per homepage section.
 * Active = the switch turns violet. Nothing else changes.
 */
export function SectionToggles({
  value,
  onChange,
  disabled = false,
  compact = false,
}: {
  value: string[];
  onChange: (next: string[]) => void;
  disabled?: boolean;
  compact?: boolean;
}) {
  const toggle = (key: SectionKey) => {
    if (disabled) return;
    const next = value.includes(key)
      ? value.filter((k) => k !== key)
      : [...value, key];
    onChange(next);
  };

  return (
    <div className={compact ? "flex flex-col gap-1.5" : "flex flex-col gap-2"}>
      {HOME_SECTIONS.map(({ key, label, Icon, hint }) => {
        const on = value.includes(key);
        return (
          <button
            key={key}
            type="button"
            role="switch"
            aria-checked={on}
            disabled={disabled}
            onClick={() => toggle(key)}
            className={`flex items-center gap-2.5 text-left rounded-xl border transition-colors ${
              compact ? "px-2.5 py-1.5" : "px-3.5 py-2.5"
            } ${
              on
                ? "border-primary/50 bg-primary/[0.05]"
                : "border-border bg-card hover:border-primary/30"
            } disabled:opacity-50`}
          >
            <span
              className={`shrink-0 flex items-center justify-center rounded-lg transition-colors ${
                compact ? "w-6 h-6" : "w-7 h-7"
              } ${on ? "bg-primary text-white" : "bg-secondary text-muted-foreground"}`}
            >
              <Icon className={compact ? "w-3 h-3" : "w-3.5 h-3.5"} />
            </span>
            <span className="min-w-0 flex-1">
              <span
                className={`block font-semibold transition-colors ${
                  compact ? "text-[11px] leading-tight" : "text-[13px]"
                } ${on ? "text-foreground" : "text-muted-foreground"}`}
              >
                {label}
              </span>
              {!compact && (
                <span className="block text-[11px] text-muted-foreground/70 leading-snug truncate">
                  {hint}
                </span>
              )}
            </span>
            {/* the switch itself */}
            <span
              aria-hidden="true"
              className={`relative shrink-0 rounded-full transition-colors duration-200 ${
                compact ? "w-8 h-[18px]" : "w-10 h-[22px]"
              } ${on ? "bg-primary" : "bg-muted-foreground/25"}`}
            >
              <span
                className={`absolute top-1/2 -translate-y-1/2 rounded-full bg-white shadow-sm transition-transform duration-200 ${
                  compact ? "w-3.5 h-3.5 left-[2px]" : "w-4 h-4 left-[3px]"
                } ${on ? (compact ? "translate-x-[14px]" : "translate-x-[17px]") : ""}`}
              />
            </span>
          </button>
        );
      })}
    </div>
  );
}
