"use client";

import React from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Reveal, PageHero, Eyebrow, Accent } from "@/components/page-parts";
import Breadcrumb from "@/components/breadcrumb";
import {
  Sparkles,
  ShoppingBag,
  BadgeCheck,
  ShieldCheck,
  HeartHandshake,
  MessageSquareHeart,
  ScanSearch,
  GitCompareArrows,
  PenLine,
  ArrowRight,
  Quote,
  Trophy,
  Mail,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

/* ------------------------- Animated count-up stat ---------------------- */

function CountUp({ to, suffix = "" }: { to: number; suffix?: string }) {
  const ref = React.useRef<HTMLSpanElement>(null);
  const [val, setVal] = React.useState(0);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let raf = 0;
    const io = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      io.disconnect();
      const start = performance.now();
      const dur = 1400;
      const tick = (t: number) => {
        const p = Math.min((t - start) / dur, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        setVal(Math.round(to * eased));
        if (p < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    });
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [to]);

  return (
    <span ref={ref} className="tabular-nums">
      {val.toLocaleString("en-IN")}
      {suffix}
    </span>
  );
}

/* ------------------------- Live site statistics ------------------------ */

interface Stats {
  products: number;
  avgRating: number | null;
}

function useSiteStats() {
  const [stats, setStats] = React.useState<Stats>({ products: 0, avgRating: null });

  React.useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const supabase = createClient();
        const { data } = await supabase
          .from("products")
          .select("id, price, rating")
          .neq("price", 0);
        if (!alive || !data) return;
        const rated = (data as { rating?: number | null }[]).filter(
          (p) => p.rating != null,
        );
        setStats({
          products: ((data as unknown[]).length || 24) as number,
          avgRating: rated.length
            ? Number(
                (
                  rated.reduce((s, p) => s + (p.rating ?? 0), 0) / rated.length
                ).toFixed(1),
              )
            : 4.5,
        });
      } catch {
        /* leave defaults */
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  return stats;
}

/* --------------------------- Section heading --------------------------- */

function SectionHead({
  eyebrow,
  eyebrowIcon,
  title,
  accentWord,
  sub,
}: {
  eyebrow: string;
  eyebrowIcon: LucideIcon;
  title: string;
  accentWord?: string;
  sub?: string;
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
    <Reveal className="max-w-2xl mx-auto text-center mb-10 sm:mb-14">
      <div className="flex justify-center mb-4">
        <Eyebrow Icon={eyebrowIcon}>{eyebrow}</Eyebrow>
      </div>
      <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight text-balance">
        {headline}
      </h2>
      {sub && (
        <p className="mt-4 text-muted-foreground text-[15px] leading-relaxed text-balance">
          {sub}
        </p>
      )}
    </Reveal>
  );
}

/* ------------------------------ The page ------------------------------- */

export default function AboutPage() {
  const { products, avgRating } = useSiteStats();

  const howWePick = [
    {
      Icon: ScanSearch,
      title: "Scan the market",
      text: "We track listings across Amazon, Flipkart and Myntra daily — new releases, hidden gems, and price movements.",
    },
    {
      Icon: GitCompareArrows,
      title: "Compare honestly",
      text: "Ratings, specs and real review sentiment are weighed side by side until only genuine contenders remain.",
    },
    {
      Icon: PenLine,
      title: "Write it straight",
      text: "Every featured product ships with plain-language pros, cons and full specs — no fluff, no paid placements.",
    },
    {
      Icon: Trophy,
      title: "Feature only the best",
      text: "Only products we'd buy ourselves make the hero showcase, the trending shelf or the fresh drops feed.",
    },
  ];

  const pillars = [
    {
      Icon: BadgeCheck,
      title: "Curated, never dumped",
      text: "A tight, deliberate catalogue. Every product has a reason to exist on this site.",
      tint: "bg-primary/10 text-primary",
    },
    {
      Icon: ShieldCheck,
      title: "Transparent by design",
      text: "Affiliate links are labelled clearly. If we earn a commission, we say so — always.",
      tint: "bg-emerald-500/10 text-emerald-600",
    },
    {
      Icon: HeartHandshake,
      title: "Reviews with a heartbeat",
      text: "Summaries built from real buyer feedback — what owners love and what they don't.",
      tint: "bg-violet-500/10 text-violet-500",
    },
  ];

  return (
    <div className="pb-24">
      {/* ═══════════════════════════ HERO ═══════════════════════════ */}
      <PageHero
        breadcrumb={<Breadcrumb items={[{ label: "About" }]} />}
        eyebrow="About Urban Deals"
        eyebrowIcon={Sparkles}
        title="Online shopping, minus the guesswork."
        accentWord="minus the guesswork"
        sub="We're a small editorial obsessed with one question — which product is actually worth your money? Every listing here has been picked with intent, priced with context, and summarised without spin."      >
        <Link href="/products">
          <Button size="lg" className="gap-2 rounded-xl font-bold shadow-md shadow-primary/20">
            <ShoppingBag className="w-4 h-4" />
            Explore the catalogue
          </Button>
        </Link>
        <Link href="/contact">
          <Button size="lg" variant="outline" className="gap-2 rounded-xl bg-transparent">
            <MessageSquareHeart className="w-4 h-4" />
            Say hello
          </Button>
        </Link>
      </PageHero>

      {/* ═══════════════════ LIVE STATS BAND ═══════════════════ */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-2">
        <Reveal>
          <div className="glass rounded-3xl p-6 sm:p-8 grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-4">
            {[
              { val: products, label: "Products curated", Icon: ShoppingBag },
              { val: 4, label: "Categories covered", Icon: Sparkles },
              { val: avgRating ?? 0, label: "Average rating", Icon: Trophy, decimal: true },
              { val: 100, label: "Percent transparent", Icon: ShieldCheck, suffix: "%" },
            ].map((s, i) => (
              <div
                key={i}
                className="flex flex-col items-center text-center gap-2 sm:[&:not(:last-child)]:border-r sm:border-r-0 border-border/70"
              >
                <span className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                  <s.Icon className="w-4.5 h-4.5" />
                </span>
                <span className="text-2xl sm:text-3xl font-extrabold text-primary leading-none">
                  {s.decimal
                    ? avgRating != null
                      ? avgRating.toFixed(1)
                      : "—"
                    : <CountUp to={s.val} suffix={s.suffix ?? ""} />}
                </span>
                <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {s.label}
                </span>
              </div>
            ))}
          </div>
        </Reveal>
      </section>

      {/* ═══════════════════ STORY (editorial split) ═══════════════════ */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          {/* text side */}
          <Reveal>
            <Eyebrow Icon={HeartHandshake}>Why we exist</Eyebrow>
            <h2 className="mt-4 text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight text-balance">
              Because the internet made shopping{" "}
              <Accent>noisy, not easier.</Accent>
            </h2>
            <div className="mt-6 space-y-4 text-[15px] leading-[1.8] text-muted-foreground">
              <p>
                One product page today exposes you to forty &ldquo;best
                seller&rdquo; badges, paid placements, fake review dumps and
                countdown timers — all engineered to make you stop comparing.
              </p>
              <p>
                Urban Deals started as a private spreadsheet between friends who
                wanted one honest shortlist before hitting checkout. That
                spreadsheet turned into this site: a calmer shelf where each item
                earns its place.
              </p>
              <p>
                We don&apos;t sell anything, ship anything or hold any stock. When
                you click &ldquo;View on Amazon&rdquo;, you&apos;re buying straight
                from the marketplace — we&apos;ve simply done the homework first.
              </p>
            </div>
          </Reveal>

          {/* visual side — clean stacked quote + banner cards */}
          <Reveal delay={150} className="relative">
            <div className="relative mx-auto max-w-md flex flex-col gap-5">
              {/* quote card */}
              <div className="glass rounded-3xl p-7 sm:p-8">
                <Quote className="w-7 h-7 text-primary/40 mb-4" />
                <p className="text-lg sm:text-xl font-bold leading-snug text-balance">
                  &ldquo;Don&apos;t try to feature everything. Feature what
                  you&apos;d proudly gift your own family.&rdquo;
                </p>
                <div className="mt-5 pt-5 border-t border-border/60 flex items-center gap-3">
                  <span className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-violet-500 text-white flex items-center justify-center text-sm font-extrabold shrink-0">
                    UD
                  </span>
                  <div>
                    <p className="text-sm font-bold">The Urban Deals desk</p>
                    <p className="text-xs text-muted-foreground">
                      Proposition 01 — editorial charter
                    </p>
                  </div>
                </div>
              </div>

              {/* banner card */}
              <div className="rounded-3xl bg-gradient-to-br from-primary to-violet-500 p-6 shadow-md shadow-primary/25">
                <p className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  0 paid placements
                </p>
                <p className="mt-3 text-white font-extrabold text-lg leading-snug">
                  Every card on our shelf is checked and published the same
                  honest way — no exceptions.
                </p>
              </div>

              {/* mini stat chips */}
              <div className="flex flex-wrap justify-center gap-2.5">
                {["48h fact corrections", "Ratings from real buyers", "Labelled affiliate links"].map(
                  (chip) => (
                    <span
                      key={chip}
                      className="glass rounded-full px-3.5 py-1.5 text-[11px] font-bold text-muted-foreground"
                    >
                      {chip}
                    </span>
                  ),
                )}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ═══════════════════ PILLARS ═══════════════════ */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 sm:pb-28">
        <SectionHead
          eyebrow="What we stand for"
          eyebrowIcon={ShieldCheck}
          title="Three promises, kept every day."
          sub="They're the reason people land here instead of an endless marketplace feed."
        />
        <div className="grid md:grid-cols-3 gap-4 sm:gap-5">
          {pillars.map((p, i) => (
            <Reveal key={i} delay={i * 110}>
              <div className="glass rounded-3xl p-6 sm:p-7 h-full group">
                <span
                  className={`inline-flex w-12 h-12 rounded-2xl items-center justify-center mb-5 transition-transform duration-300 group-hover:scale-105 ${p.tint}`}
                >
                  <p.Icon className="w-5.5 h-5.5" />
                </span>
                <h3 className="text-lg font-extrabold tracking-tight">{p.title}</h3>
                <p className="mt-2.5 text-[14.5px] leading-relaxed text-muted-foreground">
                  {p.text}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ═══════════════════ HOW WE PICK ═══════════════════ */}
      <section className="bg-card/60 border-y border-border/60 py-20 sm:py-28">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHead
            eyebrow="The process"
            eyebrowIcon={ScanSearch}
            title="How a product earns its spot."
            sub="Four uneasy steps. The same for every single item, every single time."
          />
          <div className="relative grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            {/* connector */}
            <div
              aria-hidden="true"
              className="hidden lg:block absolute top-[52px] left-[12%] right-[12%] h-px bg-gradient-to-r from-primary/10 via-primary/35 to-primary/10"
            />
            {howWePick.map((step, i) => (
              <Reveal key={i} delay={i * 120}>
                <div className="relative glass rounded-3xl p-6 h-full text-center">
                  <span className="relative inline-flex w-[72px] h-[72px] rounded-2xl bg-gradient-to-br from-white to-primary/[0.06] border border-border/70 items-center justify-center mb-5">
                    <step.Icon className="w-6.5 h-6.5 text-primary" />
                    <span className="absolute -top-2 -right-2 w-6 h-6 rounded-lg bg-primary text-white text-[11px] font-extrabold flex items-center justify-center">
                      {i + 1}
                    </span>
                  </span>
                  <h3 className="text-[15px] font-extrabold tracking-tight">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-[13.5px] leading-relaxed text-muted-foreground">
                    {step.text}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════ AFFILIATE DISCLOSURE ═══════════════════ */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
        <Reveal>
          <div className="glass rounded-3xl p-7 sm:p-10">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-4">
              <span className="shrink-0 w-11 h-11 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                <BadgeCheck className="w-5 h-5" />
              </span>
              <div>
                <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">
                  The associate disclosure, in plain words.
                </h2>
              </div>
            </div>
            <p className="text-[15px] leading-[1.8] text-muted-foreground">
              As an Amazon Associate, Urban Deals earns from qualifying purchases
              made through outbound links — at{" "}
              <strong className="text-foreground">zero extra cost to you</strong>.
              Commission never determines what we feature: a higher payout doesn&apos;t
              buy a hero slot, and a lower one doesn&apos;t bury a worthy product.
              The shelf is curated first; the links are a way to keep the lights on.
            </p>
            <div className="mt-6 flex flex-wrap gap-2.5">
              {[
                { label: "Read the full disclaimer", href: "/disclaimer" },
                { label: "Privacy policy", href: "/privacy" },
                { label: "Terms of use", href: "/terms" },
              ].map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className="rounded-xl border border-border bg-card px-4 py-2 text-xs font-bold text-muted-foreground hover:border-primary/40 hover:text-primary transition-colors"
                >
                  {l.label}
                </Link>
              ))}
            </div>
          </div>
        </Reveal>
      </section>

      {/* ═══════════════════ CTA ═══════════════════ */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <Reveal>
          <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-primary to-violet-500 p-8 sm:p-14 text-center shadow-lg shadow-primary/25">
            <div
              aria-hidden="true"
              className="absolute -top-16 -right-16 w-56 h-56 rounded-full bg-white/10 blur-2xl pointer-events-none"
            />
            <div
              aria-hidden="true"
              className="absolute -bottom-20 -left-14 w-64 h-64 rounded-full bg-white/10 blur-2xl pointer-events-none"
            />
            <div className="relative">
              <span className="inline-flex w-12 h-12 rounded-2xl bg-white/15 backdrop-blur text-white items-center justify-center mb-5">
                <ShoppingBag className="w-5.5 h-5.5" />
              </span>
              <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white text-balance leading-tight">
                Skip the noise. Shop the shortlist.
              </h2>
              <p className="mt-4 text-white/85 text-sm sm:text-base max-w-xl mx-auto text-balance">
                Check the latest picks — or tell us exactly what you&apos;re hunting
                for and we&apos;ll go find it.
              </p>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                <Link
                  href="/products"
                  className="inline-flex items-center gap-2 rounded-xl bg-white text-primary px-6 py-3 text-sm font-bold hover:bg-white/90 transition-colors"
                >
                  <ShoppingBag className="w-4 h-4" />
                  Browse products
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 rounded-xl border border-white/35 text-white px-6 py-3 text-sm font-bold hover:bg-white/10 transition-colors"
                >
                  <Mail className="w-4 h-4" />
                  Suggest a product
                </Link>
              </div>
            </div>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
