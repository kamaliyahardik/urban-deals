"use client";

import React from "react";

/**
 * Urban Deals brand mark — a sliced circle with a 4-point spark star cut
 * through the middle. Rendered via SVG mask so it works on any background.
 */
export function BrandMark({ className = "w-9 h-9" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 92" fill="none" className={className} aria-hidden="true">
      <defs>
        <mask id="urbanDealsMark">
          <rect x="0" y="0" width="100" height="92" fill="black" />
          <circle cx="50" cy="46" r="45" fill="white" />
          {/* horizontal slice */}
          <rect x="0" y="42" width="100" height="7.5" fill="black" />
          {/* 4-point spark star */}
          <path
            d="M50 4
               C53.5 30 58 38.5 72 44.5 L72 47.5
               C58 53.5 53.5 62 50 88
               C46.5 62 42 53.5 28 47.5 L28 44.5
               C42 38.5 46.5 30 50 4 Z"
            fill="black"
          />
        </mask>
      </defs>
      <rect x="0" y="0" width="100" height="92" fill="currentColor" mask="url(#urbanDealsMark)" />
    </svg>
  );
}

/** Full lockup: mark + URBAN (bold) over DEALS (light) + ® */
export function BrandLockup({
  className = "",
  markClass = "w-9 h-9",
  showR = true,
}: {
  className?: string;
  markClass?: string;
  showR?: boolean;
}) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <BrandMark className={`${markClass} text-primary`} />
      <span className="flex flex-col leading-none">
        <span className="flex items-start">
          <span className="font-extrabold tracking-[0.08em] text-[15px] text-foreground">
            URBAN
          </span>
          {showR && (
            <span className="text-[8px] font-bold text-primary ml-0.5 mt-0.5">®</span>
          )}
        </span>
        <span className="font-light tracking-[0.32em] text-[11px] text-primary mt-0.5">
          DEALS
        </span>
      </span>
    </span>
  );
}
