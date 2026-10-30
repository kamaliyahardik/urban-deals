import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  Smartphone,
  Shirt,
  ChefHat,
  Armchair,
  Watch,
  Sparkles,
  Dumbbell,
  Gamepad2,
  BookOpen,
  ShoppingBag,
  ArrowRight,
  ArrowUpRight,
  Star,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";
import DealCard from "@/components/deal-card";
import Breadcrumb from "@/components/breadcrumb";
import { getSiteUrl } from "@/lib/site";

/* ------------------------------ data -------------------------------- */

const REST_BASE = process.env.NEXT_PUBLIC_SUPABASE_URL;
const REST_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

interface CategoryRow {
  slug: string;
  name: string;
}

interface CategoryProduct {
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

function restHeaders(): HeadersInit {
  return {
    apikey: REST_KEY as string,
    Authorization: `Bearer ${REST_KEY}`,
  };
}

async function getCategory(slug: string): Promise<CategoryRow | null> {
  if (!REST_BASE || !REST_KEY) return null;
  const res = await fetch(
    `${REST_BASE}/rest/v1/categories?slug=eq.${encodeURIComponent(slug)}&select=slug,name&limit=1`,
    { headers: restHeaders(), cache: "no-store" },
  );
  if (!res.ok) return null;
  const rows = (await res.json()) as CategoryRow[];
  return rows[0] ?? null;
}

async function getProducts(slug: string): Promise<CategoryProduct[]> {
  if (!REST_BASE || !REST_KEY) return [];
  const res = await fetch(
    `${REST_BASE}/rest/v1/products?category=eq.${encodeURIComponent(slug)}&price=neq.0&select=id,name,slug,image_url,price,mrp,discount_percent,rating,review_count,source&order=created_at.desc`,
    { headers: restHeaders(), cache: "no-store" },
  );
  if (!res.ok) return [];
  return (await res.json()) as CategoryProduct[];
}

/* ------------------------------ meta -------------------------------- */

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategory(slug);
  const name = category?.name ?? decodeURIComponent(slug);
  const products = await getProducts(slug);

  const isNamed = /^[A-Za-z\s]+$/.test(name);
  const lower = name.toLowerCase();
  const keywords = isNamed
    ? [`best ${lower}`, `${lower} deals india`, `best ${lower} online`, `${lower} price in india`, `${lower} amazon india`]
    : undefined;

  return {
    title: `${name} — Best Deals & Top-Rated Picks`,
    description: `Best ${name} at the lowest price in India — top brands, real discounts and honest buyer reviews from Urban Deals. Grab the lowest price now on Amazon.`,
    keywords,
    alternates: { canonical: `/category/${slug}` },
    openGraph: {
      title: `${name} deals — Urban Deals`,
      description: `Top-rated ${name} products, real discounts, honest reviews.`,
    },
  };
}

/* ------------------------------ icon -------------------------------- */

function categoryIcon(slug: string): LucideIcon {
  switch (slug.toLowerCase()) {
    case "electronics":
      return Smartphone;
    case "fashion":
      return Shirt;
    case "kitchen":
      return ChefHat;
    case "home":
      return Armchair;
    case "watches":
      return Watch;
    case "beauty":
      return Sparkles;
    case "fitness":
    case "sports":
      return Dumbbell;
    case "toys":
      return Gamepad2;
    case "books":
      return BookOpen;
    default:
      return ShoppingBag;
  }
}

/* ------------------------------ page -------------------------------- */

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const category = await getCategory(slug);
  if (!category) notFound();

  const products = await getProducts(slug);
  const Icon = categoryIcon(category.slug);

  const rated = products.filter((p) => p.rating != null && p.rating > 0);
  const avgRating =
    rated.length > 0
      ? (rated.reduce((acc, p) => acc + (p.rating ?? 0), 0) / rated.length).toFixed(1)
      : null;

  const stats = [
    { label: "Products live", value: String(products.length) },
    { label: "Avg. rating", value: avgRating ?? "—" },
    { label: "Prices", value: "Re-checked daily" },
  ];

  const site = getSiteUrl();
  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `${category.name} deals`,
    numberOfItems: products.length,
    itemListElement: products.map((p, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: p.name,
      url: `${site}/products/${p.slug}`,
    })),
  };
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: site },
      { "@type": "ListItem", position: 2, name: "Products", item: `${site}/products` },
      { "@type": "ListItem", position: 3, name: category.name },
    ],
  };

  return (
    <div className="pt-28 sm:pt-36 pb-16 sm:pb-24">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* breadcrumb */}
        <div className="flex justify-center mb-8">
          <Breadcrumb
            items={[
              { label: "Products", href: "/products" },
              { label: category.name },
            ]}
          />
        </div>

        {/* hero */}
        <header className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <span className="inline-flex w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-gradient-to-br from-primary to-violet-500 text-white items-center justify-center shadow-lg shadow-primary/30 mb-6">
            <Icon className="w-8 h-8 sm:w-10 sm:h-10" />
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">
            {category.name}{" "}
            <span className="bg-gradient-to-r from-primary via-violet-400 to-primary bg-clip-text text-transparent">
              deals.
            </span>
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-4 leading-relaxed max-w-xl mx-auto text-balance">
            Every {category.name.toLowerCase()} pick on the shelf is hand-checked
            — specs, real buyer reviews and live prices from the stores you
            already trust.
          </p>

          {/* stat chips */}
          <div className="flex flex-wrap justify-center gap-2.5 mt-7">
            {stats.map((s) => (
              <span
                key={s.label}
                className="inline-flex items-center gap-2 rounded-full glass px-4 py-2 text-xs sm:text-[13px]"
              >
                <span className="font-extrabold text-primary">{s.value}</span>
                <span className="font-semibold text-muted-foreground">{s.label}</span>
              </span>
            ))}
          </div>
        </header>

        {/* products */}
        {products.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
            {products.map((p, i) => (
              <DealCard key={p.id} product={p} delay={i * 70} />
            ))}
          </div>
        ) : (
          <div className="glass rounded-3xl p-10 sm:p-14 text-center max-w-xl mx-auto">
            <span className="inline-flex w-14 h-14 rounded-2xl bg-secondary text-primary items-center justify-center mb-5">
              <Icon className="w-7 h-7" />
            </span>
            <h2 className="text-lg sm:text-xl font-extrabold">
              Nothing on this shelf yet
            </h2>
            <p className="text-sm text-muted-foreground mt-2.5 leading-relaxed">
              We&apos;re curating {category.name.toLowerCase()} deals right now.
              Check back soon — or browse everything that&apos;s live today.
            </p>
            <Link
              href="/products"
              className="group inline-flex items-center gap-2 mt-6 rounded-xl bg-primary text-white px-6 py-3 text-sm font-bold shadow-lg shadow-primary/25 hover:bg-primary/90 transition-colors"
            >
              Browse all products
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        )}

        {/* trust strip */}
        <div className="flex flex-wrap justify-center gap-2.5 mt-12 sm:mt-16">
          {[
            { icon: ShieldCheck, text: "Official store checkout only" },
            { icon: Star, text: "Minimum 4.0★ for most picks" },
            { icon: ArrowUpRight, text: "Full specs before you click" },
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
    </div>
  );
}
