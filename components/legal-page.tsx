"use client";

import React from "react";
import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import { ArrowRight, FileText } from "lucide-react";
import { PageHero, Reveal } from "@/components/page-parts";
import Breadcrumb from "@/components/breadcrumb";

export interface LegalSection {
  id: string;
  title: string;
  Icon: LucideIcon;
  /** Paragraphs / bullet blocks of this section */
  body: React.ReactNode;
}

/**
 * Shared premium layout for Privacy / Disclaimer / Terms pages:
 * gradient hero, slim reading-progress bar, glass section cards,
 * sticky desktop TOC with scroll-spy and a mobile chip nav.
 */
export function LegalPage({
  eyebrow,
  title,
  accentWord,
  sub,
  updated,
  sections,
}: {
  eyebrow: string;
  title: string;
  accentWord?: string;
  sub: string;
  updated: string;
  sections: LegalSection[];
}) {
  const [active, setActive] = React.useState(sections[0]?.id ?? "");
  const [progress, setProgress] = React.useState(0);

  // scroll-spy + reading progress
  React.useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort(
            (a, b) =>
              a.boundingClientRect.top - b.boundingClientRect.top,
          );
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-18% 0px -62% 0px", threshold: 0 },
    );
    sections.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) io.observe(el);
    });

    const onScroll = () => {
      const doc = document.documentElement;
      const max = doc.scrollHeight - window.innerHeight;
      setProgress(max > 0 ? Math.min(1, window.scrollY / max) : 0);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      io.disconnect();
      window.removeEventListener("scroll", onScroll);
    };
  }, [sections]);

  return (
    <div className="pb-24">
      {/* ── reading progress ── */}
      <div
        aria-hidden="true"
        className="fixed top-0 left-0 right-0 z-[60] h-1 bg-transparent pointer-events-none"
      >
        <div
          className="h-full bg-gradient-to-r from-primary to-violet-400 transition-[width] duration-150 ease-out"
          style={{ width: `${progress * 100}%` }}
        />
      </div>

      <PageHero
        breadcrumb={<Breadcrumb items={[{ label: title }]} />}
        eyebrow={eyebrow}
        eyebrowIcon={FileText}
        title={title}
        accentWord={accentWord}
        sub={sub}
      >
        <span className="inline-flex items-center gap-2 rounded-full bg-secondary px-4 py-1.5 text-xs font-bold text-muted-foreground">
          Last updated — {updated}
        </span>
        <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 text-primary px-4 py-1.5 text-xs font-bold">
          {sections.length} sections · ~2 min read
        </span>
      </PageHero>

      {/* ── mobile chip nav ── */}
      <div className="lg:hidden max-w-6xl mx-auto px-4 sm:px-6 mb-5">
        <div className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {sections.map((s, i) => (
            <a
              key={s.id}
              href={`#${s.id}`}
              className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-bold border transition-colors ${
                active === s.id
                  ? "bg-primary text-white border-primary"
                  : "bg-card border-border text-muted-foreground"
              }`}
            >
              {String(i + 1).padStart(2, "0")} · {s.title}
            </a>
          ))}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-[248px_1fr] gap-10 items-start">
          {/* ── TOC sidebar (desktop) ── */}
          <aside className="hidden lg:block sticky top-32">
            <div className="glass rounded-2xl p-4">
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-muted-foreground mb-3 px-2">
                On this page
              </p>
              <nav className="flex flex-col gap-0.5">
                {sections.map((s, i) => (
                  <a
                    key={s.id}
                    href={`#${s.id}`}
                    className={`group flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-[13px] font-medium transition-all ${
                      active === s.id
                        ? "bg-primary text-white"
                        : "text-muted-foreground hover:text-foreground hover:bg-secondary/70"
                    }`}
                  >
                    <span
                      className={`text-[10px] font-extrabold tabular-nums ${
                        active === s.id ? "text-white/70" : "text-primary/60"
                      }`}
                    >
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <s.Icon
                      className={`w-3.5 h-3.5 shrink-0 transition-colors ${
                        active === s.id
                          ? "text-white"
                          : "text-muted-foreground/60 group-hover:text-primary"
                      }`}
                    />
                    <span className="truncate">{s.title}</span>
                  </a>
                ))}
              </nav>

              <button
                type="button"
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                className="mt-3 w-full text-[11px] font-bold uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors px-2 py-2"
              >
                ↑ Back to top
              </button>
            </div>
          </aside>

          {/* ── Content ── */}
          <div className="space-y-5 min-w-0">
            {sections.map((s, i) => (
              <Reveal key={s.id} delay={Math.min(i * 60, 240)}>
                <section
                  id={s.id}
                  className="group relative glass rounded-3xl p-6 sm:p-8 scroll-mt-32 overflow-hidden"
                >
                  {/* hover accent edge */}
                  <span
                    aria-hidden="true"
                    className="absolute inset-y-0 left-0 w-0.5 bg-gradient-to-b from-primary to-violet-400 opacity-0 group-hover:opacity-100 transition-opacity"
                  />
                  <div className="flex items-center gap-3.5 mb-5 pb-4 border-b border-border/60">
                    <span className="shrink-0 w-11 h-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center transition-transform duration-300 group-hover:scale-105">
                      <s.Icon className="w-5 h-5" />
                    </span>
                    <div className="min-w-0">
                      <p className="text-[11px] font-bold uppercase tracking-widest text-primary/70 leading-none">
                        Section {String(i + 1).padStart(2, "0")}
                      </p>
                      <h2 className="mt-1.5 text-lg sm:text-xl font-extrabold tracking-tight leading-tight">
                        {s.title}
                      </h2>
                    </div>
                  </div>
                  <div className="space-y-3.5 text-[14.5px] leading-[1.75] text-muted-foreground [&_strong]:text-foreground [&_a]:text-primary [&_a]:font-semibold [&_a:hover]:underline">
                    {s.body}
                  </div>
                </section>
              </Reveal>
            ))}

            {/* bottom CTA */}
            <Reveal>
              <div className="rounded-3xl bg-primary text-white p-6 sm:p-8 flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
                <div className="flex-1 text-center sm:text-left">
                  <p className="text-lg sm:text-xl font-extrabold tracking-tight">
                    Questions about this page?
                  </p>
                  <p className="text-sm text-white/80 mt-1">
                    We&apos;re happy to clarify anything — just reach out.
                  </p>
                </div>
                <Link
                  href="/contact"
                  className="shrink-0 inline-flex items-center gap-2 rounded-xl bg-white text-primary px-5 py-2.5 text-sm font-bold hover:bg-violet-50 transition-colors"
                >
                  Contact us
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </div>
  );
}
