import React from "react";
import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";

export interface Crumb {
  label: string;
  href?: string;
}

/**
 * Pill-style breadcrumb. Home is always first; the last item renders as the
 * violet "you are here" chip. Shared across every public page.
 */
export default function Breadcrumb({
  items,
  className = "",
}: {
  items: Crumb[];
  className?: string;
}) {
  return (
    <nav
      aria-label="Breadcrumb"
      className={`inline-flex items-center max-w-full rounded-full border border-border/60 bg-card/80 backdrop-blur px-1.5 py-1 text-xs sm:text-[13px] font-medium shadow-sm ${className}`}
    >
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-muted-foreground hover:text-primary transition-colors shrink-0"
      >
        <Home className="w-3.5 h-3.5" />
        Home
      </Link>
      {items.map((item, i) => {
        const last = i === items.length - 1;
        return (
          <span key={i} className="inline-flex items-center min-w-0">
            <ChevronRight className="w-3.5 h-3.5 text-border shrink-0" />
            {item.href && !last ? (
              <Link
                href={item.href}
                className="px-2.5 py-1 rounded-full text-muted-foreground hover:text-primary transition-colors truncate"
              >
                {item.label}
              </Link>
            ) : (
              <span
                aria-current={last ? "page" : undefined}
                className="px-2.5 py-1 rounded-full bg-primary text-primary-foreground font-semibold truncate max-w-[44ch] sm:max-w-[60ch]"
              >
                {item.label}
              </span>
            )}
          </span>
        );
      })}
    </nav>
  );
}
