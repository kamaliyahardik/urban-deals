"use client";

import React from "react";
import type { LucideIcon } from "lucide-react";

/* ------------------------- Scroll-reveal wrapper ------------------------ */

export function Reveal({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = React.useRef<HTMLDivElement>(null);
  const [seen, setSeen] = React.useState(false);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setSeen(true);
          io.disconnect();
        }
      },
      { threshold: 0.12 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`transition-all duration-700 ease-out ${
        seen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-7"
      } ${className}`}
    >
      {children}
    </div>
  );
}

/* ------------------------------ Eyebrow chip ---------------------------- */

export function Eyebrow({
  Icon,
  children,
}: {
  Icon: LucideIcon;
  children: React.ReactNode;
}) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/[0.07] px-4 py-1.5 text-[11px] sm:text-xs font-bold uppercase tracking-[0.18em] text-primary">
      <Icon className="w-3.5 h-3.5" />
      {children}
    </span>
  );
}

/* ---------------------------- Gradient accent --------------------------- */

export function Accent({ children }: { children: React.ReactNode }) {
  return (
    <span className="bg-gradient-to-r from-primary via-violet-400 to-primary bg-clip-text text-transparent">
      {children}
    </span>
  );
}

/* ------------------------------- Page hero ------------------------------ */

export function PageHero({
  eyebrow,
  eyebrowIcon,
  title,
  accentWord,
  sub,
  children,
}: {
  eyebrow: string;
  eyebrowIcon: LucideIcon;
  /** Full heading; the word that matches `accentWord` gets the gradient */
  title: string;
  accentWord?: string;
  sub?: string;
  /** Buttons / actions shown under the heading */
  children?: React.ReactNode;
}) {
  let headline: React.ReactNode = title;
  if (accentWord) {
    const idx = title.indexOf(accentWord);
    if (idx >= 0) {
      headline = (
        <>
          {title.slice(0, idx)}
          <Accent>{title.slice(idx, idx + accentWord.length)}</Accent>
          {title.slice(idx + accentWord.length)}
        </>
      );
    }
  }

  return (
    <header className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 sm:pt-36 pb-14 text-center">
      {/* soft glow behind hero */}
      <div
        aria-hidden="true"
        className="absolute inset-x-0 -top-10 mx-auto w-[46rem] max-w-full h-72 rounded-full bg-primary/[0.09] blur-3xl pointer-events-none animate-glow-pulse"
      />
      <Reveal className="relative">
        <div className="flex justify-center mb-5">
          <Eyebrow Icon={eyebrowIcon}>{eyebrow}</Eyebrow>
        </div>
        <h1 className="text-4xl sm:text-5xl lg:text-[3.4rem] font-extrabold tracking-tight leading-[1.08] max-w-4xl mx-auto text-balance">
          {headline}
        </h1>
        {sub && (
          <p className="mt-5 sm:mt-6 text-base sm:text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto text-balance">
            {sub}
          </p>
        )}
        {children && (
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            {children}
          </div>
        )}
      </Reveal>
    </header>
  );
}
