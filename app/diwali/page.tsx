import Link from "next/link";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import {
  Sparkles,
  Watch,
  Gift,
  Flame,
  Heart,
  Gem,
  ArrowRight,
  Star,
  Clock,
  ShieldCheck,
  ChevronDown,
  ExternalLink,
  type LucideIcon,
} from "lucide-react";
import DealCard from "@/components/deal-card";
import Breadcrumb from "@/components/breadcrumb";
import { Reveal, Accent } from "@/components/page-parts";
import { getSiteUrl } from "@/lib/site";

/* ------------------------------ data -------------------------------- */

const REST_BASE = process.env.NEXT_PUBLIC_SUPABASE_URL;
const REST_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const SITE_URL = getSiteUrl();

interface Deal {
  id: number;
  name: string;
  slug: string;
  image_url: string | null;
  price: number;
  mrp: number | null;
  discount_percent: number | null;
  rating: number | null;
  review_count: number | null;
  source: string | null;
}

const DEAL_FIELDS =
  "id,name,slug,image_url,price,mrp,discount_percent,rating,review_count,source";

function restHeaders(): HeadersInit {
  return {
    apikey: REST_KEY as string,
    Authorization: `Bearer ${REST_KEY}`,
  };
}

async function fetchDeals(query: string): Promise<Deal[]> {
  if (!REST_BASE || !REST_KEY) return [];
  try {
    const res = await fetch(`${REST_BASE}/rest/v1/products?${query}`, {
      headers: restHeaders(),
      cache: "no-store",
    });
    if (!res.ok) return [];
    return (await res.json()) as Deal[];
  } catch {
    return [];
  }
}

const getWatches = () =>
  fetchDeals(
    `or=(category.eq.watches,name.ilike.*watch*)&price=neq.0&select=${DEAL_FIELDS}&order=rating.desc.nullslast&limit=12`,
  );

const getGiftsUnder500 = () =>
  fetchDeals(
    `price=gte.1&price=lte.500&rating=gte.3.5&select=${DEAL_FIELDS}&order=rating.desc.nullslast&limit=8`,
  );

const getGiftPicks = () =>
  fetchDeals(
    `rating=gte.4&price=gte.200&price=neq.0&select=${DEAL_FIELDS}&order=discount_percent.desc.nullslast&limit=12`,
  );

const getBeauty = () =>
  fetchDeals(
    `category=eq.beauty&rating=gte.4&price=neq.0&select=${DEAL_FIELDS}&order=rating.desc.nullslast&limit=8`,
  );

const getPremium = () =>
  fetchDeals(
    `price=gte.2000&rating=gte.4&select=${DEAL_FIELDS}&order=rating.desc.nullslast&limit=8`,
  );

/* ------------------------------ meta -------------------------------- */

export const metadata: Metadata = {
  title: "Best Diwali Gifts & Diwali Watch Deals 2026",
  description:
    "Curated Diwali gift ideas from Amazon India — the best Diwali gifts, Diwali watch deals and gifts under ₹500 with real discounts and honest ratings.",
  alternates: { canonical: "/diwali" },
  robots: { index: true, follow: true },
  keywords: [
    "best diwali gifts",
    "diwali gifts 2026",
    "diwali watches",
    "diwali watch deals",
    "diwali gifts for boyfriend",
    "diwali gifts for girlfriend",
    "diwali gifts for husband",
    "diwali gifts for wife",
    "diwali gifts for family",
    "diwali deals amazon",
    "diwali gift under 500",
    "diwali gift under 1000",
  ],
  openGraph: {
    title: "Best Diwali Gifts & Diwali Watch Deals 2026",
    description:
      "Curated Diwali gift ideas from Amazon India — the best Diwali gifts, Diwali watch deals and gifts under ₹500 with real discounts and honest ratings.",
  },
};

/* --------------------------- section head ---------------------------- */

function joinList(items: string[]): string {
  if (items.length <= 1) return items[0] ?? "";
  return `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;
}

function SectionHead({
  eyebrow,
  Icon,
  title,
  sub,
  count,
  href,
  linkLabel,
}: {
  eyebrow: string;
  Icon: LucideIcon;
  title: ReactNode;
  sub: string;
  count: number;
  href: string;
  linkLabel: string;
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
        <span className="text-muted-foreground font-semibold">{linkLabel}</span>
        <span className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center transition-transform group-hover:translate-x-0.5">
          <ArrowRight className="w-3 h-3" />
        </span>
      </Link>
    </Reveal>
  );
}

/* ------------------------------- FAQ --------------------------------- */

const WATCH_BRANDS = [
  "Titan",
  "Fastrack",
  "Casio",
  "Sonata",
  "Fossil",
  "Timex",
  "Noise",
  "Fire-Boltt",
  "boAt",
];

function buildFaqItems(watchNames: string[]) {
  const hits = WATCH_BRANDS.filter((b) =>
    watchNames.some((n) => n.toLowerCase().includes(b.toLowerCase())),
  );
  const brandList = hits.length
    ? joinList(hits.slice(0, 4))
    : "Titan, Fastrack and Casio";

  return [
    {
      q: "What are the best Diwali gifts in 2026?",
      a: "The most-loved Diwali gift ideas for 2026 are premium watches, beauty hampers, gadgets and home upgrades — something that looks festive without wrecking your budget. Every pick on this page is filtered by real buyer ratings and live prices, so you're choosing from proven crowd-pleasers instead of guesswork.",
    },
    {
      q: "Which watch is best as a Diwali gift?",
      a: `For parents and elders, a clean analogue dial from trusted names like ${brandList} rarely goes wrong; fitness-first smartwatches suit younger siblings and partners better. Our Diwali watch deals section above shows the live price, rating and discount side by side — just match the dial to the person and the budget.`,
    },
    {
      q: "What is a good Diwali gift under ₹500?",
      a: "Small but useful wins at this budget — earphones, candles and home accents, skincare minis, quirky kitchen tools or a solid notebook set. Our Gifts under ₹500 section filters for real ratings (3.5★ and up), so even a budget Diwali gift lands well when the box is opened.",
    },
    {
      q: "Are Diwali deals discounted genuinely?",
      a: "Often yes, but always compare. Every deal card here shows the MRP next to the live price along with the real buyer rating, so you can judge whether the festive discount is honest. Festive prices can be limited-time — confirm the final price on the product page before you check out.",
    },
    {
      q: "When is the best time to shop for Diwali deals?",
      a: "Diwali 2026 falls in November. Stores usually announce festive sales from early October, with the steepest discounts landing during the big sale windows in the weeks before Diwali. Prices move fast, so when a deal looks right, re-check the live price before buying.",
    },
    {
      q: "Is buying through Urban Deals safe?",
      a: "Yes. Every link on this page opens the product directly on Amazon India's secure checkout — we never handle your payment or personal details. As an Amazon Associate we may earn a small commission on your purchase, at no additional cost to you.",
    },
  ];
}

/* --------------------------- JSON-LD helpers -------------------------- */

function faqJsonLd(items: { q: string; a: string }[]) {
  return JSON.stringify({
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  });
}

/* ------------------------------- page -------------------------------- */

export default async function DiwaliPage() {
  const [watches, giftsUnder500, giftPicks, beauty, premium] =
    await Promise.all([
      getWatches(),
      getGiftsUnder500(),
      getGiftPicks(),
      getBeauty(),
      getPremium(),
    ]);

  const faqItems = buildFaqItems(watches.map((w) => w.name));

  const allDeals = Array.from(
    new Map(
      [...watches, ...giftsUnder500, ...giftPicks, ...beauty, ...premium].map(
        (p) => [p.id, p],
      ),
    ).values(),
  );

  const rated = allDeals.filter((p) => p.rating != null && p.rating > 0);
  const minRating =
    rated.length > 0
      ? Math.min(...rated.map((p) => p.rating as number)).toFixed(1)
      : null;

  const stats = [
    { label: "Deals live", value: String(allDeals.length) },
    { label: "Minimum ★ rating", value: minRating ?? "4★+" },
    { label: "Prices", value: "Re-checked daily" },
  ];

  const itemListJsonLd = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: allDeals.map((p, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: p.name,
      url: `${SITE_URL}/products/${p.slug}`,
      image: p.image_url || undefined,
    })),
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-card/30 to-background pt-28 sm:pt-36 pb-16 sm:pb-24">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* breadcrumb */}
        <div className="flex justify-center mb-8">
          <Breadcrumb items={[{ label: "Diwali Deals" }]} />
        </div>

        {/* hero */}
        <header className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <Reveal>
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass text-[11px] sm:text-xs font-bold uppercase tracking-[0.18em] text-primary mb-5">
              <Sparkles className="w-3.5 h-3.5" />
              Diwali 2026 · Festive Edition
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            </span>
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight text-balance">
              Best Diwali Gifts &amp;{" "}
              <span className="bg-gradient-to-r from-primary via-violet-400 to-primary bg-clip-text text-transparent">
                Watch Deals
              </span>
              , curated.
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground mt-4 leading-relaxed max-w-xl mx-auto text-balance">
              Hand-picked Diwali gift ideas for everyone on your list — festive
              watch deals, beauty hampers, gadgets and home picks at real
              discounts from Amazon India. Every card shows the live price
              against the MRP, so the deal you see is the deal you get.
            </p>

            {/* stat chips */}
            <div className="flex flex-wrap justify-center gap-2.5 mt-7">
              {stats.map((s) => (
                <span
                  key={s.label}
                  className="inline-flex items-center gap-2 rounded-full glass px-4 py-2 text-xs sm:text-[13px]"
                >
                  <span className="font-extrabold text-primary">{s.value}</span>
                  <span className="font-semibold text-muted-foreground">
                    {s.label}
                  </span>
                </span>
              ))}
            </div>
          </Reveal>
        </header>

        {/* ── Diwali watch deals ─────────────────────────────────── */}
        {watches.length > 0 && (
          <section className="mb-16 sm:mb-20">
            <SectionHead
              eyebrow="Diwali watch deals"
              Icon={Watch}
              title={
                <>
                  A timepiece makes{" "}
                  <Accent>a timeless Diwali gift.</Accent>
                </>
              }
              sub="Festive watch deals from Amazon India — top-rated dials for your partner, parents and siblings, sorted by real buyer ratings."
              count={watches.length}
              href="/category/watches"
              linkLabel="view all watches"
            />
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
              {watches.map((p, i) => (
                <DealCard key={p.id} product={p} delay={i * 70} />
              ))}
            </div>
          </section>
        )}

        {/* ── Gifts under ₹500 ───────────────────────────────────── */}
        {giftsUnder500.length > 0 && (
          <section className="mb-16 sm:mb-20">
            <SectionHead
              eyebrow="Budget Diwali"
              Icon={Gift}
              title={
                <>
                  Gifts under{" "}
                  <Accent>₹500, still impressive.</Accent>
                </>
              }
              sub="Small-budget Diwali gifting that doesn't look small — earphones, home accents and useful picks, all under ₹500."
              count={giftsUnder500.length}
              href="/products"
              linkLabel="browse all deals"
            />
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
              {giftsUnder500.map((p, i) => (
                <DealCard key={p.id} product={p} delay={i * 70} />
              ))}
            </div>
          </section>
        )}

        {/* ── Festive gift picks ─────────────────────────────────── */}
        {giftPicks.length > 0 && (
          <section className="mb-16 sm:mb-20">
            <SectionHead
              eyebrow="Reader favourites"
              Icon={Flame}
              title={
                <>
                  Festive gift picks{" "}
                  <Accent>our readers love.</Accent>
                </>
              }
              sub="Bestsellers our shoppers keep buying this season — biggest festive discounts first, all rated 4★ and above."
              count={giftPicks.length}
              href="/products"
              linkLabel="browse all deals"
            />
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
              {giftPicks.map((p, i) => (
                <DealCard key={p.id} product={p} delay={i * 70} />
              ))}
            </div>
          </section>
        )}

        {/* ── Beauty hampers ─────────────────────────────────────── */}
        {beauty.length > 0 && (
          <section className="mb-16 sm:mb-20">
            <SectionHead
              eyebrow="Self-care edition"
              Icon={Heart}
              title={
                <>
                  Beauty hampers &amp;{" "}
                  <Accent>self-care treats.</Accent>
                </>
              }
              sub="Make-up sets, skincare hampers and self-care picks — the gifts that get used long after the diyas are packed away."
              count={beauty.length}
              href="/category/beauty"
              linkLabel="view all beauty"
            />
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
              {beauty.map((p, i) => (
                <DealCard key={p.id} product={p} delay={i * 70} />
              ))}
            </div>
          </section>
        )}

        {/* ── Premium picks ──────────────────────────────────────── */}
        {premium.length > 0 && (
          <section className="mb-16 sm:mb-20">
            <SectionHead
              eyebrow="A-grade gifting"
              Icon={Gem}
              title={
                <>
                  Premium gifts for the{" "}
                  <Accent>A-grade gifting.</Accent>
                </>
              }
              sub="When only the best will do — high-value picks for your wife, husband or parents, all rated 4★ and above."
              count={premium.length}
              href="/products"
              linkLabel="browse all deals"
            />
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
              {premium.map((p, i) => (
                <DealCard key={p.id} product={p} delay={i * 70} />
              ))}
            </div>
          </section>
        )}

        {/* ── Gifting cheat-sheet ────────────────────────────────── */}
        <section className="mb-16 sm:mb-20">
          <SectionHead
            eyebrow="Gifting cheat-sheet"
            Icon={Sparkles}
            title={
              <>
                Who are you gifting{" "}
                <Accent>this Diwali?</Accent>
              </>
            }
            sub="A quick map from person to present — pair the recipient with the right shelf above."
            count={allDeals.length}
            href="/products"
            linkLabel="browse all deals"
          />
          <Reveal>
            <dl className="rounded-3xl border border-border/60 bg-card divide-y divide-border/50 overflow-hidden">
              {[
                {
                  k: "For parents",
                  v: "Premium watches & kitchen upgrades — the classics that still delight.",
                },
                {
                  k: "For siblings",
                  v: "Gadgets & make-up hampers — trendy, useful and unlikely to be returned.",
                },
                {
                  k: "For your partner",
                  v: "Jewellery-inspired beauty sets & fashion watches — a Diwali gift for boyfriend or girlfriend that says you sorted it.",
                },
                {
                  k: "For the whole family",
                  v: "Home picks and bestsellers everyone shares — our festive gift picks shelf above.",
                },
                {
                  k: "Budget Diwali",
                  v: "Thoughtful gifts under ₹500 (and under ₹1,000) that still look festive on the outside.",
                },
              ].map((row) => (
                <div
                  key={row.k}
                  className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-6 p-5"
                >
                  <dt className="w-48 shrink-0 text-sm font-extrabold">
                    {row.k}
                  </dt>
                  <dd className="text-sm text-muted-foreground leading-relaxed">
                    {row.v}
                  </dd>
                </div>
              ))}
            </dl>
          </Reveal>
        </section>

        {/* ── FAQ ────────────────────────────────────────────────── */}
        <section className="mb-16 sm:mb-20">
          <SectionHead
            eyebrow="Festive FAQs"
            Icon={Clock}
            title={
              <>
                Diwali shopping,{" "}
                <Accent>answered plainly.</Accent>
              </>
            }
            sub="The questions everyone asks before buying a Diwali gift — straight answers, no fine print."
            count={0}
            href="/contact"
            linkLabel="ask us anything"
          />
          <div className="max-w-3xl mx-auto space-y-3">
            {faqItems.map((f) => (
              <Reveal key={f.q}>
                <details className="group rounded-2xl border border-border/60 bg-card px-5 py-4 open:border-primary/30 open:bg-card open:shadow-md hover:border-primary/20 transition-all">
                  <summary className="flex items-center justify-between gap-4 cursor-pointer list-none text-sm sm:text-[15px] font-bold">
                    {f.q}
                    <span className="shrink-0 w-8 h-8 rounded-xl bg-secondary text-foreground/70 flex items-center justify-center group-open:bg-primary group-open:text-white transition-colors">
                      <ChevronDown className="w-4 h-4 group-open:rotate-180 transition-transform" />
                    </span>
                  </summary>
                  <p className="text-sm text-muted-foreground leading-relaxed mt-3">
                    {f.a}
                  </p>
                </details>
              </Reveal>
            ))}
          </div>
        </section>

        {/* ── Amazon Associates disclosure ───────────────────────── */}
        <section>
          <Reveal>
            <div className="rounded-2xl border border-border/60 bg-card/70 p-5 sm:p-6 flex flex-col sm:flex-row items-start gap-4">
              <span className="shrink-0 w-10 h-10 rounded-xl bg-secondary flex items-center justify-center text-foreground/70">
                <ExternalLink className="w-4 h-4" />
              </span>
              <div>
                <h3 className="text-sm font-bold mb-1.5">Affiliate disclosure</h3>
                <p className="text-xs sm:text-[13px] text-muted-foreground leading-relaxed">
                  As an Amazon Associate, Urban Deals may earn a commission from
                  qualifying purchases made through the Diwali deals on this
                  page —{" "}
                  <strong className="text-foreground/80">
                    at no additional cost to you
                  </strong>
                  . Festive prices change fast; the final price and availability
                  are always confirmed on the Amazon India product page before
                  you check out.
                </p>
              </div>
            </div>
          </Reveal>
        </section>

        {/* trust strip */}
        <div className="flex flex-wrap justify-center gap-2.5 mt-12 sm:mt-16">
          {[
            { icon: ShieldCheck, text: "Official Amazon India checkout only" },
            { icon: Star, text: "Real buyer ratings on every card" },
            { icon: Clock, text: "Limited-time festive prices" },
          ].map((c) => (
            <span
              key={c.text}
              className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/70 px-4 py-2 text-[11px] sm:text-xs font-semibold text-muted-foreground"
            >
              <c.icon className="w-3.5 h-3.5 text-primary" />
              {c.text}
            </span>
          ))}
        </div>
      </div>

      {/* ── Structured data ──────────────────────────────────────── */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: faqJsonLd(faqItems) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              {
                "@type": "ListItem",
                position: 1,
                name: "Home",
                item: SITE_URL,
              },
              {
                "@type": "ListItem",
                position: 2,
                name: "Diwali Deals",
                item: `${SITE_URL}/diwali`,
              },
            ],
          }),
        }}
      />
      {allDeals.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: itemListJsonLd }}
        />
      )}
    </div>
  );
}
