"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import DealCard from "@/components/deal-card";
import { Reveal } from "@/components/page-parts";
import Breadcrumb from "@/components/breadcrumb";
import {
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Star,
  IndianRupee,
  FileText,
  ListChecks,
  Table2,
  MessagesSquare,
  ShoppingBag,
  ShieldCheck,
  BadgeCheck,
  BellRing,
} from "lucide-react";

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  affiliate_link: string;
  image_url: string;
  category: string;
  created_at: string;
  slug: string;
  // A-to-Z fields (absent on legacy products)
  mrp?: number | null;
  discount_percent?: number | null;
  currency?: string | null;
  brand?: string | null;
  sku?: string | null;
  source?: string | null;
  rating?: number | null;
  review_count?: number | null;
  availability?: string | null;
  images?: string[] | null;
  specs?: { key: string; value: string }[] | null;
  reviews?: {
    author: string;
    rating: number | null;
    title: string;
    body: string;
    date: string | null;
  }[] | null;
}

interface ProductValue {
  id: number;
  value_text: string;
}

interface RelatedProduct {
  id: number;
  name: string;
  slug: string;
  image_url: string;
  price: number;
  rating?: number | null;
  mrp?: number | null;
  discount_percent?: number | null;
  source?: string | null;
}

/** Strip size variants so the same photo never shows twice. */
function imageKey(url: string): string {
  return url
    .replace(/([._])SL\d+/g, "$1")
    .replace(/\.?_?SL\d+_/g, "")
    .replace(/\._[^.]+\.(jpg|png|webp)/i, "")
    .replace(/\/(\d+)\/(\d+)\//g, "/")
    .replace(/h_\d+(,q_\d+)?,w_\d+\//g, "")
    .split("?")[0]
    .replace(/\.(jpg|jpeg|png|webp)$/i, "")
    .toLowerCase();
}

/* ------------------------------ UI bits ------------------------------ */

function Stars({ value, size = 14 }: { value: number; size?: number }) {
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

function SectionCard({
  title,
  icon,
  count,
  action,
  children,
  className = "",
}: {
  title: string;
  icon: React.ReactNode;
  count?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`relative bg-card/80 backdrop-blur border border-border/60 rounded-3xl p-5 sm:p-8 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-3 duration-500 ${className}`}
    >
      {/* top hairline accent */}
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent"
      />
      <div className="flex items-center justify-between mb-5 sm:mb-6">
        <div className="flex items-center gap-3">
          <span className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-primary to-violet-400 text-white flex items-center justify-center shadow-md shadow-primary/25">
            {icon}
          </span>
          <h2 className="text-lg sm:text-2xl font-bold tracking-tight">{title}</h2>
          {count && (
            <span className="hidden sm:inline-flex text-xs font-semibold px-2.5 py-1 rounded-full bg-secondary text-secondary-foreground">
              {count}
            </span>
          )}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

const AVATAR_HUES = 360;
function avatarStyle(name: string) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) % AVATAR_HUES;
  return { backgroundColor: `hsl(${h} 48% 45%)` };
}

/* ------------------------------ Page ------------------------------ */

export default function ProductDetailClient() {
  const params = useParams();
  const slug = params.slug as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [values, setValues] = useState<ProductValue[]>([]);
  const [related, setRelated] = useState<RelatedProduct[]>([]);
  // breadcrumb me sirf HAMARI categories aati hain (admin-managed),
  // Amazon se aaya brand/Amazon ki category nahi
  const [category, setCategory] = useState<{
    name: string;
    slug: string;
  } | null>(null);
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProductDetails() {
      try {
        const supabase = createClient();

        let { data: productData, error: productError } = await supabase
          .from("products")
          .select("*")
          .eq("slug", slug)
          .single();

        if ((!productData || productError) && !isNaN(Number(slug))) {
          const { data: productById } = await supabase
            .from("products")
            .select("*")
            .eq("id", slug)
            .single();
          if (productById) {
            productData = productById;
            productError = null;
          }
        }

        if (productError) throw productError;
        setProduct(productData);

        if (productData) {
          const { data: valuesData, error: valuesError } = await supabase
            .from("product_values")
            .select("*")
            .eq("product_id", productData.id);
          if (valuesError) throw valuesError;
          setValues(valuesData || []);

          if (productData.category) {
            const [relRes, catRes] = await Promise.all([
              supabase
                .from("products")
                .select("id, name, slug, image_url, price, rating, mrp, discount_percent, source")
                .eq("category", productData.category)
                .neq("id", productData.id)
                .limit(4),
              // resolve OUR category (admin-managed) for the breadcrumb
              supabase
                .from("categories")
                .select("name, slug")
                .eq("slug", productData.category)
                .maybeSingle(),
            ]);
            setRelated(relRes.data || []);
            setCategory(
              catRes.data
                ? { name: catRes.data.name, slug: catRes.data.slug }
                : null,
            );
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load product");
      } finally {
        setLoading(false);
      }
    }

    if (slug) fetchProductDetails();
  }, [slug]);

  // Gallery — dedupe near-identical photos, keep highest-quality variant
  const gallery = Array.from(
    new Map(
      [product?.image_url ?? "", ...(product?.images ?? [])]
        .filter(Boolean)
        .map((u) => {
          const match = u.match(/(?:SL(\d+)|(?:\/(1\d{3}|1280))\/|,w(\d{3,4}))|(\d{4})/);
          const size = match
            ? Math.max(...[match[1], match[2], match[3], match[4]].map(Number).filter(Number.isFinite))
            : 0;
          return [imageKey(u), { url: u, size }] as [string, { url: string; size: number }];
        })
        .sort((a, b) => b[1].size - a[1].size),
    ).values(),
  ).map((e) => e.url);

  const inStock = product?.availability !== "Out of Stock";
  const sourceLabel = product?.source
    ? product.source.charAt(0).toUpperCase() + product.source.slice(1)
    : "Amazon";

  if (loading) {
    return (
      <div className="min-h-screen bg-background pt-28 px-6 flex items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <span className="text-muted-foreground text-sm">Loading product…</span>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-background pt-28 px-4">
        <div className="max-w-4xl mx-auto">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-primary hover:text-primary/80 mb-8"
          >
            <ChevronLeft className="w-4 h-4" /> Back to Home
          </Link>
          <div className="text-center py-16">
            <h2 className="text-3xl font-bold mb-2">Product Not Found</h2>
            <p className="text-muted-foreground text-sm sm:text-base">
              The product you&apos;re looking for doesn&apos;t exist or has been removed.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/40 pb-24 lg:pb-20">
      {/* ── Breadcrumb ─────────────────────────────────────────── */}
      <div className="max-w-6xl mx-auto px-3 sm:px-6 lg:px-8 pt-28">
        <Breadcrumb
          items={[
            { label: "Products", href: "/products" },
            ...(category ? [{ label: category.name, href: `/category/${category.slug}` }] : []),
            { label: product.name },
          ]}
        />
      </div>

      {/* ── Product stage ──────────────────────────────────────── */}
      <div className="max-w-6xl mx-auto px-3 sm:px-6 lg:px-8 mt-4 sm:mt-6">
        <div className="relative rounded-[2rem] sm:rounded-[2.5rem] border border-border/60 bg-gradient-to-br from-white via-white to-primary/[0.05] shadow-sm overflow-hidden">
          {/* decorative blobs */}
          <div
            aria-hidden="true"
            className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-primary/[0.06] blur-3xl pointer-events-none"
          />
          <div
            aria-hidden="true"
            className="absolute -bottom-28 -left-20 w-80 h-80 rounded-full bg-violet-400/[0.07] blur-3xl pointer-events-none"
          />
          <div
            aria-hidden="true"
            className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent"
          />

          <div className="relative grid lg:grid-cols-[minmax(0,46%)_1fr] gap-6 sm:gap-10 lg:gap-14 p-4 sm:p-8 lg:p-10">
            {/* Gallery */}
            <div className="animate-in fade-in duration-500 mx-auto w-full max-w-[320px] sm:max-w-[400px] lg:max-w-none">
              <div className="relative group aspect-square rounded-3xl overflow-hidden border border-border/60 shadow-xl bg-gradient-to-br from-white via-white to-primary/[0.06]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  key={galleryIndex}
                  src={gallery[galleryIndex] || "/placeholder.svg"}
                  alt={`${product.name} — view ${galleryIndex + 1}`}
                  className="w-full h-full object-contain p-6 sm:p-10 lg:p-12 transition-transform duration-500 ease-out group-hover:scale-[1.07]"
                />
                {gallery.length > 1 && (
                  <>
                    <button
                      type="button"
                      aria-label="Previous image"
                      onClick={() => setGalleryIndex((i) => (i - 1 + gallery.length) % gallery.length)}
                      className="absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 p-2 sm:p-2.5 rounded-full bg-white/90 backdrop-blur border border-border/60 shadow hover:scale-110 active:scale-95 transition"
                    >
                      <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                    <button
                      type="button"
                      aria-label="Next image"
                      onClick={() => setGalleryIndex((i) => (i + 1) % gallery.length)}
                      className="absolute right-2.5 sm:right-3 top-1/2 -translate-y-1/2 p-2 sm:p-2.5 rounded-full bg-white/90 backdrop-blur border border-border/60 shadow hover:scale-110 active:scale-95 transition"
                    >
                      <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                    <div className="flex items-center justify-center gap-1.5 absolute bottom-3.5 sm:bottom-4 left-1/2 -translate-x-1/2">
                      {gallery.map((_, i) => (
                        <button
                          key={i}
                          type="button"
                          aria-label={`Go to image ${i + 1}`}
                          onClick={() => setGalleryIndex(i)}
                          className={`h-1.5 rounded-full transition-all ${
                            i === galleryIndex
                              ? "w-6 bg-primary"
                              : "w-1.5 bg-foreground/25 hover:bg-foreground/40"
                          }`}
                        />
                      ))}
                    </div>
                  </>
                )}
                {product.discount_percent != null && product.discount_percent > 0 && (
                  <span className="absolute top-3.5 left-3.5 sm:top-4 sm:left-4 px-3 py-1.5 rounded-xl bg-emerald-600 text-white text-xs sm:text-sm font-bold tracking-wide shadow-lg shadow-emerald-600/25">
                    {product.discount_percent}% OFF
                  </span>
                )}
                {product.source && (
                  <span className="absolute top-3.5 right-3.5 sm:top-4 sm:right-4 px-2.5 py-1.5 rounded-xl bg-white/90 backdrop-blur border border-border/40 text-[10px] sm:text-xs font-extrabold uppercase tracking-wider text-muted-foreground shadow-sm">
                    {product.source}
                  </span>
                )}
              </div>

              {/* Thumbnails */}
              {gallery.length > 1 && (
                <div className="flex gap-2.5 sm:gap-3 mt-3 sm:mt-4 overflow-x-auto pb-2 snap-x [scrollbar-width:thin]">
                  {gallery.map((img, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setGalleryIndex(i)}
                      className={`shrink-0 snap-start w-[64px] h-[64px] sm:w-[88px] sm:h-[88px] rounded-2xl border-2 overflow-hidden bg-gradient-to-br from-white to-primary/[0.04] transition-all ${
                        i === galleryIndex
                          ? "border-primary ring-2 ring-primary/20 shadow-md scale-[1.04]"
                          : "border-border/60 hover:border-primary/40 hover:scale-[1.02]"
                      }`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={img} alt="" loading="lazy" className="w-full h-full object-contain p-1.5 sm:p-2" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Buy box */}
            <div className="flex flex-col animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="flex flex-wrap items-center gap-2 mb-2.5">
                {category && (
                  <Link
                    href={`/category/${category.slug}`}
                    className="text-sm font-bold text-primary uppercase tracking-widest hover:text-primary/80 transition-colors"
                  >
                    {category.name}
                  </Link>
                )}
                {product.source && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-muted text-muted-foreground text-xs font-bold uppercase">
                    {sourceLabel}
                    {inStock && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />}
                  </span>
                )}
                {!inStock && (
                  <span className="px-2.5 py-1 rounded-full bg-destructive/10 text-destructive text-xs font-bold">
                    Out of Stock
                  </span>
                )}
              </div>

              <h1 className="text-xl sm:text-3xl lg:text-[2.5rem] font-extrabold leading-tight tracking-tight text-balance mb-3 sm:mb-4">
                {product.name}
              </h1>

              {/* Rating */}
              {(product.rating != null || product.review_count != null) && (
                <div className="flex flex-wrap items-center gap-2.5 mb-4 sm:mb-5">
                  {product.rating != null && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-400/15 text-amber-600 text-sm font-bold">
                      <Star className="w-4 h-4 fill-amber-500 text-amber-500" /> {product.rating}
                    </span>
                  )}
                  <Stars value={product.rating ?? 0} />
                  {product.review_count != null && (
                    <a
                      href="#reviews"
                      className="text-sm text-muted-foreground hover:text-primary hover:underline"
                    >
                      {product.review_count.toLocaleString("en-IN")} ratings
                    </a>
                  )}
                </div>
              )}

              {/* Price block */}
              <div className="rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/[0.07] via-transparent to-violet-400/[0.05] p-4 sm:p-5 shadow-sm mb-5 sm:mb-6">
                <div className="flex items-end flex-wrap gap-x-3 gap-y-1">
                  <span className="text-3xl sm:text-4xl font-extrabold tracking-tight flex items-start text-primary">
                    <IndianRupee className="w-4 h-4 sm:w-5 sm:h-5 mt-1.5 sm:mt-2 mr-0.5" />
                    {product.price.toLocaleString("en-IN")}
                  </span>
                  {product.mrp != null && product.mrp > product.price && (
                    <span className="text-lg sm:text-xl text-muted-foreground line-through mb-1">
                      ₹{product.mrp.toLocaleString("en-IN")}
                    </span>
                  )}
                  {product.discount_percent != null && product.discount_percent > 0 && (
                    <span className="text-base sm:text-lg font-bold text-emerald-600 mb-1 flex items-center gap-1">
                      ({product.discount_percent}% off)
                    </span>
                  )}
                </div>
                <div className="flex items-center flex-wrap gap-x-3 gap-y-1.5 mt-2.5">
                  {product.mrp != null && product.mrp > product.price && (
                    <span className="text-[11px] sm:text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-1 rounded-lg uppercase tracking-wide">
                      You save ₹{(product.mrp - product.price).toLocaleString("en-IN")}
                    </span>
                  )}
                  <p className="text-[11px] sm:text-xs text-muted-foreground">
                    {inStock
                      ? "Price may change — use coupons & offers at checkout"
                      : "Currently unavailable — check the store for equivalents"}
                  </p>
                </div>
              </div>

              {/* CTA — one consistent design across the whole page.
                  Native <a> (not window.open) so popups never get blocked. */}
              <div className="mb-2">
                <a
                  href={inStock ? product.affiliate_link || "#" : undefined}
                  target="_blank"
                  rel="noopener noreferrer sponsored"
                  className={`inline-flex w-full items-center justify-center gap-2 rounded-xl font-bold shadow-lg transition-all h-12 text-[15px] sm:h-14 sm:text-base ${
                    inStock
                      ? "bg-primary text-white hover:bg-primary/90 active:scale-[0.99] shadow-primary/30"
                      : "pointer-events-none bg-muted text-muted-foreground cursor-not-allowed shadow-none"
                  }`}
                >
                  {inStock ? "Buy Now" : "Currently Unavailable"}
                  <ExternalLink className="w-4 h-4 sm:w-5 sm:h-5" />
                </a>
              </div>
              <p className="text-xs text-muted-foreground mb-3 sm:mb-4">
                You will be redirected to {sourceLabel} to complete the purchase —
                the price stays the same for you.
              </p>

              {/* micro-trust row */}
              <div className="flex flex-wrap gap-2 mt-auto">
                {[
                  { icon: ShieldCheck, text: "Official store checkout" },
                  { icon: BadgeCheck, text: "Same price for you" },
                  { icon: BellRing, text: "Prices re-checked" },
                ].map((t) => (
                  <span
                    key={t.text}
                    className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-white/70 px-3 py-1.5 text-[11px] font-semibold text-muted-foreground"
                  >
                    <t.icon className="w-3.5 h-3.5 text-primary" />
                    {t.text}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Sections ───────────────────────────────────────────── */}
      <div className="max-w-6xl mx-auto px-3 sm:px-6 lg:px-8 mt-10 sm:mt-14 space-y-6 sm:space-y-10">
        <SectionCard title="Description" icon={<FileText className="w-4.5 h-4.5 sm:w-5 sm:h-5" />}>
          {product.description ? (
            <div className="rounded-2xl border border-border/40 bg-gradient-to-br from-primary/[0.04] to-transparent px-4 sm:px-7 py-4 sm:py-6">
              <p className="text-sm sm:text-base text-foreground/80 leading-[1.85] whitespace-pre-line first-letter:text-3xl first-letter:font-bold first-letter:text-primary first-letter:pr-1">
                {product.description}
              </p>
            </div>
          ) : (
            <p className="text-muted-foreground italic text-sm">
              No description provided for this product.
            </p>
          )}
        </SectionCard>

        {values.length > 0 && (
          <SectionCard
            title="Key Features"
            icon={<ListChecks className="w-4.5 h-4.5 sm:w-5 sm:h-5" />}
            count={`${values.length} highlights`}
          >
            <ul className="grid sm:grid-cols-2 gap-2.5 sm:gap-3">
              {values.map((value, i) => (
                <li
                  key={value.id}
                  className="group flex items-start gap-3 sm:gap-3.5 rounded-2xl border border-border/50 bg-gradient-to-br from-primary/[0.05] to-transparent hover:from-primary/10 hover:border-primary/30 px-3.5 sm:px-4 py-3 sm:py-3.5 transition-all hover:-translate-y-0.5"
                >
                  <span className="shrink-0 w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-xs font-bold group-hover:bg-primary group-hover:text-primary-foreground transition-colors mt-0.5">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="text-[13px] sm:text-sm leading-relaxed text-foreground/85 pt-1 min-w-0">
                    {value.value_text}
                  </span>
                </li>
              ))}
            </ul>
          </SectionCard>
        )}

        {product.specs && product.specs.length > 0 && (
          <SectionCard
            title="Specifications"
            icon={<Table2 className="w-4.5 h-4.5 sm:w-5 sm:h-5" />}
            count={`${product.specs.length} details`}
          >
            <div className="grid sm:grid-cols-2 gap-x-6 sm:gap-x-10 gap-y-0">
              {product.specs.map((spec, i) => (
                <div
                  key={i}
                  className="flex items-start justify-between gap-4 sm:gap-6 py-2.5 sm:py-3 border-b border-border/40 text-[13px] sm:text-sm last:border-0"
                >
                  <span className="font-medium text-foreground/75 flex items-start gap-2 min-w-0">
                    <span className="w-1.5 h-1.5 mt-1.5 rounded-full bg-primary/50 shrink-0" />
                    <span className="line-clamp-1">{spec.key}</span>
                  </span>
                  <span className="text-muted-foreground text-right sm:max-w-[60%] min-w-0 break-words">
                    {spec.value}
                  </span>
                </div>
              ))}
            </div>
          </SectionCard>
        )}

        {product.reviews && product.reviews.length > 0 && (
          <section id="reviews" className="scroll-mt-24 animate-in fade-in slide-in-from-bottom-3 duration-500">
            <div className="bg-card/80 backdrop-blur border border-border/60 rounded-3xl shadow-sm overflow-hidden">
              {/* Summary band */}
              <div className="grid md:grid-cols-[260px_1fr] divide-y md:divide-y-0 md:divide-x divide-border/50">
                <div className="p-6 sm:p-8 flex sm:flex-col items-center sm:justify-center text-center bg-gradient-to-b from-amber-400/[0.1] to-transparent gap-4 sm:gap-0">
                  <p className="text-5xl sm:text-6xl font-extrabold tracking-tight text-amber-500 leading-none">
                    {product.rating ?? "—"}
                  </p>
                  <div className="sm:mt-2">
                    {product.rating != null && <Stars value={product.rating} size={18} />}
                    <p className="text-xs sm:text-sm text-muted-foreground mt-2 max-w-[220px]">
                      {product.review_count != null
                        ? `${product.review_count.toLocaleString("en-IN")} verified ratings`
                        : "Buyer verified"}
                    </p>
                  </div>
                </div>

                <div className="p-5 sm:p-8">
                  <div className="flex items-center justify-between mb-4 sm:mb-5">
                    <h2 className="text-lg sm:text-2xl font-bold tracking-tight flex items-center gap-2.5">
                      <MessagesSquare className="w-5 h-5 sm:w-6 sm:h-6 text-violet-500" />
                      What buyers say
                    </h2>
                    <span className="hidden sm:inline-flex text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600">
                      {product.reviews.length} latest
                    </span>
                  </div>
                  <div className="space-y-3 sm:space-y-4">
                    {product.reviews.map((review, i) => (
                      <div
                        key={i}
                        className="rounded-2xl border border-border/50 bg-background/70 hover:border-primary/30 hover:shadow-md transition-all p-3.5 sm:p-5"
                      >
                        <div className="flex items-center gap-2.5 sm:gap-3 mb-2">
                          <span
                            className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-sm"
                            style={avatarStyle((review.author || "A").toUpperCase())}
                          >
                            {(review.author || "A").charAt(0).toUpperCase()}
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="text-[13px] sm:text-sm font-semibold truncate">
                              {review.author || "Verified Buyer"}
                            </p>
                            <div className="flex items-center gap-2 flex-wrap">
                              {review.rating != null && (
                                <Stars value={review.rating} size={11} />
                              )}
                              {review.date && (
                                <span className="text-[11px] sm:text-xs text-muted-foreground">
                                  · {review.date}
                                </span>
                              )}
                            </div>
                          </div>
                          {review.rating != null && (
                            <span className="shrink-0 px-2 py-1 rounded-lg bg-amber-400/15 text-amber-600 text-xs font-bold">
                              {review.rating}/5
                            </span>
                          )}
                        </div>
                        {review.title && (
                          <p className="font-bold text-sm sm:text-[15px] text-foreground/90 mb-1">
                            “{review.title}”
                          </p>
                        )}
                        {review.body && (
                          <p className="text-[13px] sm:text-sm text-muted-foreground leading-relaxed">
                            {review.body}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                  <a
                    href={product.affiliate_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-[13px] sm:text-sm font-semibold text-primary hover:underline mt-4 sm:mt-6"
                  >
                    Read all {product.review_count?.toLocaleString("en-IN") ?? ""} reviews on{" "}
                    {sourceLabel} <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Related */}
        {related.length > 0 && (
          <section className="pb-2">
            <div className="flex items-end justify-between gap-4 mb-6 sm:mb-8">
              <div>
                <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass text-[11px] font-bold uppercase tracking-widest text-primary mb-3">
                  <ShoppingBag className="w-3.5 h-3.5" />
                  More like this
                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                  You may also{" "}
                  <span className="bg-gradient-to-r from-primary via-violet-400 to-primary bg-clip-text text-transparent">
                    like.
                  </span>
                </h2>
              </div>
              <Link
                href={`/category/${product.category}`}
                className="group shrink-0 inline-flex items-center gap-2 rounded-full glass px-4 py-2.5 text-[13px] font-bold text-foreground/80 hover:text-primary transition-colors"
              >
                View all
                <span className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center transition-transform group-hover:translate-x-0.5">
                  <ChevronRight className="w-3 h-3" />
                </span>
              </Link>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
              {related.map((rel, i) => (
                <DealCard key={rel.id} product={rel} delay={i * 70} />
              ))}
            </div>
          </section>
        )}

        {/* ── Bottom CTA band ────────────────────────────────── */}
        <Reveal>
          <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-primary via-violet-500 to-violet-600 p-8 sm:p-12 text-center shadow-xl shadow-primary/25 mt-4">
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
            <div className="relative flex flex-wrap items-center justify-center gap-2.5 mb-6">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 backdrop-blur px-3.5 py-1.5 text-[11px] font-bold text-white">
                <ShieldCheck className="w-3.5 h-3.5" />
                Official {sourceLabel} checkout
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 backdrop-blur px-3.5 py-1.5 text-[11px] font-bold text-white">
                <BadgeCheck className="w-3.5 h-3.5" />
                Same price for you
              </span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white text-balance leading-tight">
              Ready to grab this deal?
            </h2>
            <p className="text-sm sm:text-base text-white/85 mt-3 max-w-xl mx-auto leading-relaxed text-balance">
              Straight to the official {sourceLabel} listing — no redirects, no
              waiting, no price games.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-8">
              <a
                href={inStock ? product.affiliate_link || "#" : undefined}
                target="_blank"
                rel="noopener noreferrer sponsored"
                className={`inline-flex items-center justify-center gap-2 rounded-xl font-bold text-sm px-8 h-12 transition-all ${
                  inStock
                    ? "bg-white text-primary hover:bg-violet-50 shadow-lg active:scale-[0.99]"
                    : "pointer-events-none bg-white/40 text-white/80 cursor-not-allowed"
                }`}
              >
                {inStock ? "Buy Now" : "Currently Unavailable"}
                <ExternalLink className="w-4 h-4" />
              </a>
              {category && (
                <Link
                  href={`/category/${category.slug}`}
                  className="inline-flex items-center gap-2 border border-white/35 text-white px-7 py-3 rounded-xl font-bold text-sm hover:bg-white/10 transition-colors"
                >
                  More {category.name.toLowerCase()} deals
                  <ChevronRight className="w-4 h-4" />
                </Link>
              )}
            </div>
          </div>
        </Reveal>
      </div>

      {/* ── Sticky mobile buy bar (sits above the bottom dock) ─── */}
      <div className="fixed inset-x-0 z-40 lg:hidden px-3 pb-[calc(env(safe-area-inset-bottom)+5.75rem)] pointer-events-none">
        <div className="max-w-md mx-auto rounded-2xl bg-card/95 backdrop-blur-xl border border-border shadow-2xl shadow-zinc-950/15 p-2.5 flex items-center gap-3 pointer-events-auto">
          <span className="text-xl font-extrabold text-primary shrink-0 tracking-tight flex items-start">
            <IndianRupee className="w-3.5 h-3.5 mt-1 mr-0.5" />
            {product.price.toLocaleString("en-IN")}
          </span>
          {product.mrp != null && product.mrp > product.price && (
            <span className="text-xs text-muted-foreground line-through">
              ₹{product.mrp.toLocaleString("en-IN")}
            </span>
          )}
          <a
            href={product.affiliate_link || "#"}
            target="_blank"
            rel="noopener noreferrer sponsored"
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl font-bold h-11 bg-primary text-white hover:bg-primary/90 shadow-md shadow-primary/25 transition-colors"
          >
            {inStock ? "Buy Now" : "Check Deal"}
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>
    </div>
  );
}
