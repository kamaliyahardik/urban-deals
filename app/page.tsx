"use client";

import React from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import HeroSection from "@/components/HeroSection";
import DealCard from "@/components/deal-card";
import {
  Star,
  Zap,
  ShieldCheck,
  Search,
  Scale,
  BadgeCheck,
  Smartphone,
  Shirt,
  ChefHat,
  Armchair,
  Watch,
  Sparkles,
  Dumbbell,
  ShoppingBag,
  BookOpen,
  Gamepad2,
  ArrowRight,
  ArrowUpRight,
  Tag,
  Clock,
  Percent,
  MessageSquareText,
  FileSearch,
  ListChecks,
  CreditCard,
  ChevronDown,
  ExternalLink,
  Flame,
  Snowflake,
} from "lucide-react";

/* ------------------------------ Types ------------------------------ */

interface Product {
  id: number;
  name: string;
  slug: string;
  image_url: string | null;
  price: number;
  mrp?: number | null;
  discount_percent?: number | null;
  rating?: number | null;
  review_count?: number | null;
  category?: string | null;
  source?: string | null;
  created_at?: string | null;
  home_sections?: string[] | null;
}

function Capacade({ category }: { category: string | null }) {
  switch ((category || "").toLowerCase()) {
    case "electronics":
      return <Smartphone className="w-full h-full" />;
    case "fashion":
      return <Shirt className="w-full h-full" />;
    case "kitchen":
      return <ChefHat className="w-full h-full" />;
    case "home":
      return <Armchair className="w-full h-full" />;
    case "watches":
      return <Watch className="w-full h-full" />;
    case "beauty":
      return <Sparkles className="w-full h-full" />;
    case "fitness":
    case "sports":
      return <Dumbbell className="w-full h-full" />;
    case "toys":
      return <Gamepad2 className="w-full h-full" />;
    case "books":
      return <BookOpen className="w-full h-full" />;
    default:
      return <ShoppingBag className="w-full h-full" />;
  }
}

/* --------------------- Scroll-reveal wrapper ------------------------ */

function Reveal({
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

/* --------------------------- Section head --------------------------- */

function SectionTitle({
  eyebrow,
  title,
  sub,
}: {
  eyebrow: string;
  title: string;
  sub?: string;
}) {
  return (
    <Reveal className="text-center max-w-2xl mx-auto mb-10 sm:mb-12">
      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full glass text-[11px] font-bold uppercase tracking-widest text-primary mb-4">
        <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
        {eyebrow}
      </span>
      <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight">
        {title}
      </h2>
      {sub && (
        <p className="text-sm sm:text-base text-muted-foreground mt-3 leading-relaxed">
          {sub}
        </p>
      )}
    </Reveal>
  );
}

/* --------------------- Editorial split section head --------------------- */

function SplitHeading({
  eyebrow,
  Icon,
  title,
  sub,
  count,
  href,
}: {
  eyebrow: string;
  Icon: React.ComponentType<{ className?: string }>;
  title: React.ReactNode;
  sub: string;
  count: number;
  href: string;
}) {
  return (
    <Reveal className="flex flex-col md:flex-row md:items-end justify-between gap-5 mb-10 sm:mb-12">
      <div className="max-w-xl">
        <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass text-[11px] font-bold uppercase tracking-widest text-primary mb-4">
          <Icon className="w-3.5 h-3.5" />
          {eyebrow}
          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
        </span>
        <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight text-balance">
          {title}
        </h2>
        <p className="text-sm sm:text-base text-muted-foreground mt-3 leading-relaxed">
          {sub}
        </p>
      </div>
      <Link
        href={href}
        className="group shrink-0 inline-flex items-center gap-2 rounded-full glass px-4 py-2.5 text-[13px] font-bold text-foreground/80 hover:text-primary transition-colors"
      >
        <span className="tabular-nums">{count}</span>
        <span className="text-muted-foreground font-semibold">
          {count === 1 ? "deal" : "deals"} live
        </span>
        <span className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center transition-transform group-hover:translate-x-0.5">
          <ArrowRight className="w-3 h-3" />
        </span>
      </Link>
    </Reveal>
  );
}

/* --------------------------- Product deal card ---------------------- */

function Stars({ value, size = 12 }: { value: number; size?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          style={{ width: size, height: size }}
          className={
            i <= Math.round(value)
              ? "text-amber-400 fill-amber-400"
              : "text-muted-foreground/25 fill-transparent"
          }
        />
      ))}
    </div>
  );
}

/* ------------------------------ FAQ item ---------------------------- */

const FAQS = [
  {
    q: "How do affiliate deal sites work?",
    a: "We research, compare and hand-pick products from Amazon. When you buy through our links, we may earn a small commission from the store — at zero extra cost to you. The price stays the same for you either way.",
  },
  {
    q: "Is buying through your links safe?",
    a: "Yes. Clicking a deal takes you to the official Amazon India website and the purchase happens directly on their secured checkout. We never handle your payment or personal details.",
  },
  {
    q: "Are the prices shown here always current?",
    a: "We verify prices before adding a deal and keep popular products updated. Deals and discounts can change anytime at the store's end, so always confirm the final price on the product page before buying.",
  },
  {
    q: "Do you accept paid or fake reviews?",
    a: "No. Reviews and ratings you see come from real buyers on the store page. Whether a deal earns us a commission or not, we show the honest rating along with it.",
  },
];

function FaqItem({ q, a, index, number }: { q: string; a: string; index: number; number: number }) {
  const [open, setOpen] = React.useState(index === 0);
  return (
    <Reveal delay={index * 60} className="w-full">
      <div
        className={`rounded-2xl border transition-all duration-300 ${
          open
            ? "border-primary/30 bg-card shadow-md"
            : "border-border/60 bg-card/60 hover:border-primary/20"
        }`}
      >
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="w-full flex items-center justify-between gap-4 px-4 sm:px-6 py-4 text-left"
        >
          <span className="flex items-center gap-3 min-w-0">
            <span
              className={`shrink-0 w-7 h-7 rounded-lg text-[11px] font-extrabold flex items-center justify-center transition-colors ${
                open ? "bg-primary text-white" : "bg-secondary text-muted-foreground"
              }`}
            >
              {String(number).padStart(2, "0")}
            </span>
            <span className="text-sm sm:text-[15px] font-bold">{q}</span>
          </span>
          <span
            className={`shrink-0 w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-300 ${
              open ? "bg-primary text-white rotate-180" : "bg-secondary text-foreground/70"
            }`}
          >
            <ChevronDown className="w-4 h-4" />
          </span>
        </button>
        <div
          className={`grid transition-all duration-300 ease-out ${
            open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
          }`}
        >
          <div className="overflow-hidden">
            <p className="px-4 sm:px-6 pb-5 text-sm text-muted-foreground leading-relaxed">
              {a}
            </p>
          </div>
        </div>
      </div>
    </Reveal>
  );
}

/* -------------------------------- Page ------------------------------ */

export default function HomePage() {
  const [featured, setFeatured] = React.useState<Product[]>([]);
  const [latest, setLatest] = React.useState<Product[]>([]);
  const [categories, setCategories] = React.useState<string[]>([]);

  React.useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const supabase = createClient();
        const { data } = await supabase
          .from("products")
          .select(
            "id, name, slug, image_url, price, mrp, discount_percent, rating, review_count, category, source, created_at, home_sections",
          )
          .neq("price", 0);
        if (!alive || !data) return;
        const list = data as Product[];

        // Strict admin-curation: a section shows ONLY what is toggled on
        const bySection = (tag: string) =>
          list.filter((p) => (p.home_sections ?? []).includes(tag)).slice(0, 4);

        setFeatured(bySection("trending"));
        setLatest(bySection("fresh"));
        const cats = Array.from(
          new Set(list.map((p) => p.category?.trim()).filter((c): c is string => Boolean(c))),
        ).slice(0, 8);
        setCategories(cats.length ? cats : []);
      } catch {
        /* page must never break */
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-card/30 to-background">
      <HeroSection />

      {/* ── Category quick browse ─────────────────────────────── */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <SectionTitle
            eyebrow="Shop by category"
            title="Jump straight to what you need"
            sub="Every category curated the same way — top-rated products, best current price, honest reviews."
          />
          {categories.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
              {categories.map((cat, i) => (
                <Reveal key={cat} delay={i * 60}>
                  <Link
                    href={`/category/${cat}`}
                    className="group flex items-center gap-3 sm:gap-4 rounded-2xl border border-border/60 bg-card p-3.5 sm:p-4 hover:border-primary/40 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
                  >
                    <span className="shrink-0 w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center p-2.5 group-hover:bg-primary group-hover:text-white group-hover:scale-105 transition-all duration-300">
                      <Capacade category={cat} />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-sm sm:text-[15px] font-bold capitalize truncate">
                        {cat}
                      </span>
                      <span className="flex items-center gap-1 text-[11px] sm:text-xs text-muted-foreground group-hover:text-primary transition-colors">
                        Shop now
                        <ArrowUpRight className="w-3 h-3" />
                      </span>
                    </span>
                  </Link>
                </Reveal>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
              {["Electronics", "Fashion", "Watches", "Beauty"].map((cat, i) => (
                <Reveal key={cat} delay={i * 60}>
                  <Link
                    href="/products"
                    className="group flex items-center gap-4 rounded-2xl border border-border/60 bg-card p-4 hover:border-primary/40 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
                  >
                    <span className="shrink-0 w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center p-2.5 group-hover:bg-primary group-hover:text-white transition-all duration-300">
                      <Capacade category={cat} />
                    </span>
                    <span className="text-sm sm:text-[15px] font-bold">{cat}</span>
                  </Link>
                </Reveal>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── Trending price-tag strip ──────────────────────────── */}
      <section className="px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <Reveal>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
              {[
                {
                  icon: <Clock className="w-4 h-4" />,
                  title: "Price-checked daily",
                  sub: "Popular deals re-verified",
                },
                {
                  icon: <Percent className="w-4 h-4" />,
                  title: "Real discount %",
                  sub: "Only live, honest discounts",
                },
                {
                  icon: <MessageSquareText className="w-4 h-4" />,
                  title: "Buyer-first reviews",
                  sub: "Real ratings, no spin",
                },
                {
                  icon: <ShieldCheck className="w-4 h-4" />,
                  title: "Safe to shop",
                  sub: "Links go to Amazon directly",
                },
              ].map((item, i) => (
                <div
                  key={i}
                  className="glass rounded-2xl p-4 flex items-center gap-3"
                >
                  <span className="shrink-0 w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                    {item.icon}
                  </span>
                  <span className="min-w-0">
                    <span className="block text-[13px] font-bold leading-tight">
                      {item.title}
                    </span>
                    <span className="block text-[11px] sm:text-xs text-muted-foreground truncate">
                      {item.sub}
                    </span>
                  </span>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── Trending deals ────────────────────────────────────── */}
      {featured.length > 0 && (
        <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <SplitHeading
              eyebrow="Trending deals"
              Icon={Flame}
              title={
                <>
                  Highest-rated,{" "}
                  <span className="bg-gradient-to-r from-primary via-violet-400 to-primary bg-clip-text text-transparent">
                    right now.
                  </span>
                </>
              }
              sub="Hand-picked from our shelf — the deals we're shouting about today."
              count={featured.length}
              href="/products"
            />
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
              {featured.map((p, i) => (
                <DealCard key={p.id} product={p} delay={i * 80} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── How it works ──────────────────────────────────────── */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-card/40">
        <div className="max-w-6xl mx-auto">
          <SectionTitle
            eyebrow="How it works"
            title="From search to savings in 4 steps"
            sub="We do the digging. You just tap buy — on the store you already trust."
          />
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 relative">
            {/* connector line — desktop */}
            <div
              aria-hidden
              className="hidden lg:block absolute top-10 left-[12%] right-[12%] h-px border-t border-dashed border-primary/40"
            />
            {[
              {
                icon: <FileSearch className="w-5 h-5" />,
                title: "We research",
                sub: "Specs, ratings, prices and real buyer feedback — checked before we list anything.",
              },
              {
                icon: <ListChecks className="w-5 h-5" />,
                title: "We shortlist",
                sub: "Only products worth your money make it to the site. The rest we skip.",
              },
              {
                icon: <Tag className="w-5 h-5" />,
                title: "We track the deal",
                sub: "MRP vs. current price, live discount and stock — shown honestly on every card.",
              },
              {
                icon: <CreditCard className="w-5 h-5" />,
                title: "You buy & save",
                sub: "One tap takes you to Amazon's secure checkout. Same price for you, small referral for us.",
              },
            ].map((step, i) => (
              <Reveal key={i} delay={i * 90}>
                <div className="relative h-full rounded-2xl border border-border/60 bg-card p-5 sm:p-6 hover:border-primary/30 hover:shadow-lg transition-all duration-300">
                  <span className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-violet-400 text-white shadow-md shadow-primary/25 relative z-10">
                    {step.icon}
                  </span>
                  <span className="absolute top-5 right-5 text-3xl font-extrabold text-primary/10 select-none">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3 className="text-base sm:text-lg font-bold mt-4">{step.title}</h3>
                  <p className="text-[13px] sm:text-sm text-muted-foreground mt-2 leading-relaxed">
                    {step.sub}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Why choose us ─────────────────────────────────────── */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <SectionTitle
            eyebrow="Why Urban Deals"
            title="Built for buyers, not for brands"
            sub="No sponsored fluff. No fake ratings. Just deals that survive the scrutiny."
          />
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            {[
              {
                icon: <Search className="w-5 h-5" />,
                title: "Expert curated",
                sub: "Every product vetted for quality, value and real-world usefulness before it goes live.",
              },
              {
                icon: <Zap className="w-5 h-5" />,
                title: "Always updated",
                sub: "Prices, discounts and stock status refreshed — dead deals don't make the page.",
              },
              {
                icon: <Star className="w-5 h-5" />,
                title: "Real reviews shown",
                sub: "You see the genuine buyer rating and select reviews right beside the deal.",
              },
              {
                icon: <BadgeCheck className="w-5 h-5" />,
                title: "Zero-pressure shopping",
                sub: "Buy when you're ready. We're a shortcut to a good decision, not a countdown timer.",
              },
            ].map((f, i) => (
              <Reveal key={i} delay={i * 80}>
                <div className="group h-full rounded-2xl border border-border/60 bg-card p-5 sm:p-6 hover:border-primary/30 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                  <span className="inline-flex w-11 h-11 rounded-xl bg-primary/10 text-primary items-center justify-center group-hover:bg-primary group-hover:text-white group-hover:scale-105 transition-all duration-300">
                    {f.icon}
                  </span>
                  <h3 className="text-[15px] sm:text-base font-bold mt-4">{f.title}</h3>
                  <p className="text-[13px] sm:text-sm text-muted-foreground mt-2 leading-relaxed">
                    {f.sub}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Fresh drops ───────────────────────────────────────── */}
      {latest.length > 0 && (
        <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-card/40">
          <div className="max-w-6xl mx-auto">
            <SplitHeading
              eyebrow="Fresh drops"
              Icon={Snowflake}
              title={
                <>
                  Recently added,{" "}
                  <span className="bg-gradient-to-r from-primary via-violet-400 to-primary bg-clip-text text-transparent">
                    first come, first saved.
                  </span>
                </>
              }
              sub="The newest finds on the shelf — hot off the curation desk."
              count={latest.length}
              href="/products"
            />
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
              {latest.slice(0, 4).map((p, i) => (
                <DealCard key={p.id} product={p} delay={i * 80} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Deal alert CTA ────────────────────────────────────── */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <Reveal>
            <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-primary via-violet-500 to-violet-600 p-8 sm:p-14 text-center shadow-xl shadow-primary/25">
              {/* decorative blobs */}
              <div
                aria-hidden="true"
                className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-white/10 blur-2xl pointer-events-none"
              />
              <div
                aria-hidden="true"
                className="absolute -bottom-24 -left-16 w-80 h-80 rounded-full bg-white/[0.07] blur-2xl pointer-events-none"
              />
              <div
                aria-hidden="true"
                className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/50 to-transparent"
              />

              {/* floating trust badges */}
              <div className="relative flex flex-wrap justify-center gap-2.5 mb-7">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 backdrop-blur px-3.5 py-1.5 text-[11px] font-bold text-white">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Amazon secure checkout
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 backdrop-blur px-3.5 py-1.5 text-[11px] font-bold text-white">
                  <BadgeCheck className="w-3.5 h-3.5" />
                  Same price for you
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 backdrop-blur px-3.5 py-1.5 text-[11px] font-bold text-white">
                  <Clock className="w-3.5 h-3.5" />
                  Prices re-checked daily
                </span>
              </div>

              <div className="relative">
                <h2 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white text-balance leading-tight">
                  Never miss a good deal.
                </h2>
                <p className="text-sm sm:text-base text-white/85 mt-4 max-w-xl mx-auto leading-relaxed text-balance">
                  Prices move fast on marketplaces. We track them so you don&apos;t
                  have to — every deal on our shelf is live, honest and one tap
                  from checkout.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-8">
                  <Link
                    href="/products"
                    className="group inline-flex items-center gap-2 bg-white text-primary px-7 py-3.5 rounded-xl font-bold text-sm shadow-lg hover:bg-violet-50 transition-all active:scale-95 w-full sm:w-auto justify-center"
                  >
                    Browse the shelf
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                  <Link
                    href="/about"
                    className="inline-flex items-center gap-2 border border-white/35 text-white px-7 py-3.5 rounded-xl font-bold text-sm hover:bg-white/10 transition-colors w-full sm:w-auto justify-center"
                  >
                    How our picks work
                    <ArrowUpRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── FAQ ───────────────────────────────────────────────── */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-[1fr_1.5fr] gap-10 lg:gap-16 items-start">
          {/* sticky intro */}
          <Reveal className="lg:sticky lg:top-32">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full glass text-[11px] font-bold uppercase tracking-widest text-primary mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              FAQs
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight text-balance">
              Straight answers,{" "}
              <span className="bg-gradient-to-r from-primary via-violet-400 to-primary bg-clip-text text-transparent">
                no fine-print games.
              </span>
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground mt-4 leading-relaxed">
              The things people actually ask before buying through us — numbered
              out plainly. No legalese, no surprises.
            </p>

            {/* still curious card */}
            <div className="glass rounded-2xl p-5 mt-7">
              <p className="text-[15px] font-bold">Still got a question?</p>
              <p className="text-[13px] text-muted-foreground mt-1.5 leading-relaxed">
                The desk answers everything within a day — usually way faster.
              </p>
              <Link
                href="/contact"
                className="group inline-flex items-center gap-2 mt-4 rounded-xl bg-primary text-white px-4 py-2.5 text-[13px] font-bold shadow-md shadow-primary/20 hover:bg-primary/90 transition-colors"
              >
                Ask us directly
                <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>
          </Reveal>

          {/* accordion list */}
          <div className="space-y-3">
            {FAQS.map((f, i) => (
              <FaqItem key={i} q={f.q} a={f.a} index={i} number={i + 1} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Amazon Associates disclosure ──────────────────────── */}
      <section className="px-4 sm:px-6 lg:px-8 pb-4">
        <div className="max-w-4xl mx-auto">
          <Reveal>
            <div className="rounded-2xl border border-border/60 bg-card/70 p-5 sm:p-6 flex flex-col sm:flex-row items-start gap-4">
              <span className="shrink-0 w-10 h-10 rounded-xl bg-secondary flex items-center justify-center text-foreground/70">
                <ExternalLink className="w-4 h-4" />
              </span>
              <div>
                <h3 className="text-sm font-bold mb-1.5">Affiliate disclosure</h3>
                <p className="text-xs sm:text-[13px] text-muted-foreground leading-relaxed">
                  As an Amazon Associate, Urban Deals may earn a commission from
                  qualifying purchases made through links on this site —{" "}
                  <strong className="text-foreground/80">
                    at no additional cost to you
                  </strong>
                  . Prices displayed are indicative and were accurate at the time
                  of listing; please confirm the final price on the store page
                  before purchasing.
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
