"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Star,
  BadgeCheck,
  Sparkles,
  IndianRupee,
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
  action,
  children,
}: {
  title: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="bg-card border border-border/70 rounded-3xl p-6 sm:p-8 shadow-sm">
      <div className="flex items-center justify-between mb-5">
        <h2 className="flex items-center gap-2.5 text-xl sm:text-2xl font-bold tracking-tight">
          {icon && <span className="text-primary">{icon}</span>}
          {title}
        </h2>
        {action}
      </div>
      {children}
    </section>
  );
}

const avatarHues = 360;
function avatarStyle(name: string) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) % avatarHues;
  return { backgroundColor: `hsl(${h} 45% 40%)` };
}

/* ------------------------------ Page ------------------------------ */

export default function ProductDetailPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [values, setValues] = useState<ProductValue[]>([]);
  const [related, setRelated] = useState<RelatedProduct[]>([]);
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProductDetails() {
      try {
        const supabase = createClient();

        // Try fetch by slug first
        let { data: productData, error: productError } = await supabase
          .from("products")
          .select("*")
          .eq("slug", slug)
          .single();

        // If not found by slug, try by ID (if slug is numeric)
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

          // Related products from the same category
          if (productData.category) {
            const { data: relData } = await supabase
              .from("products")
              .select("id, name, slug, image_url, price, rating")
              .eq("category", productData.category)
              .neq("id", productData.id)
              .limit(4);
            setRelated(relData || []);
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

  // Gallery — dedupe near-identical photos (same image at different sizes),
  // keep the highest-quality version of each.
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
      <div className="min-h-screen bg-background pt-28 px-6 flex items-center justify-center">
        <Loader2 className="w-9 h-9 animate-spin text-primary" />
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
            <p className="text-muted-foreground">
              The product you&apos;re looking for doesn&apos;t exist or has been removed.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/30 pb-24">
      {/* ── Breadcrumb ─────────────────────────────────────────── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-28">
        <nav className="flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
          <Link href="/" className="hover:text-primary transition-colors hover:underline">
            Home
          </Link>
          <span>/</span>
          <Link
            href={`/products?category=${product.category}`}
            className="hover:text-primary hover:underline capitalize"
          >
            {product.brand || product.category}
          </Link>
          <span>/</span>
          <span className="text-foreground font-medium max-w-[320px] truncate">
            {product.name}
          </span>
        </nav>
      </div>

      {/* ── Hero: gallery + buy box ────────────────────────────── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <div className="grid lg:grid-cols-[minmax(0,46%)_1fr] gap-10 lg:gap-14">
          {/* Gallery */}
          <div>
            <div className="relative group aspect-square rounded-3xl overflow-hidden border border-border/60 shadow-xl bg-gradient-to-br from-white via-white to-primary/[0.04]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                key={galleryIndex}
                src={gallery[galleryIndex] || "/placeholder.svg"}
                alt={`${product.name} — view ${galleryIndex + 1}`}
                className="w-full h-full object-contain p-10 sm:p-14 transition-transform duration-500 ease-out group-hover:scale-[1.07]"
              />
              {gallery.length > 1 && (
                <>
                  <button
                    type="button"
                    aria-label="Previous image"
                    onClick={() => setGalleryIndex((i) => (i - 1 + gallery.length) % gallery.length)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full glass shadow hover:scale-110 active:scale-95 transition"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    type="button"
                    aria-label="Next image"
                    onClick={() => setGalleryIndex((i) => (i + 1) % gallery.length)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full glass shadow hover:scale-110 active:scale-95 transition"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                  <div className="flex items-center justify-center gap-1.5 absolute bottom-4 left-1/2 -translate-x-1/2">
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
                <span className="absolute top-4 left-4 px-3.5 py-1.5 rounded-2xl bg-emerald-600 text-white text-sm font-bold shadow-lg shadow-emerald-600/25">
                  {product.discount_percent}% OFF
                </span>
              )}
            </div>

            {/* Thumbnails */}
            {gallery.length > 1 && (
              <div className="flex gap-3 mt-4 overflow-x-auto pb-2 snap-x [scrollbar-width:thin]">
                {gallery.map((img, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setGalleryIndex(i)}
                    className={`shrink-0 snap-start w-[76px] h-[76px] sm:w-[88px] sm:h-[88px] rounded-2xl border-2 overflow-hidden bg-gradient-to-br from-white to-primary/[0.04] transition-all ${
                      i === galleryIndex
                        ? "border-primary ring-2 ring-primary/20 shadow-md scale-[1.04]"
                        : "border-border/60 hover:border-primary/40 hover:scale-[1.02]"
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={img} alt="" loading="lazy" className="w-full h-full object-contain p-2" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Buy box */}
          <div className="flex flex-col">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              {product.brand && (
                <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary uppercase tracking-wide">
                  <BadgeCheck className="w-4 h-4" /> {product.brand}
                </span>
              )}
              {product.source && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-muted text-muted-foreground text-xs font-semibold uppercase">
                  {sourceLabel}
                  {inStock && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />}
                </span>
              )}
              {!inStock && (
                <span className="px-2.5 py-1 rounded-full bg-destructive/10 text-destructive text-xs font-semibold">
                  Out of Stock
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-4xl font-bold leading-tight tracking-tight mb-4">
              {product.name}
            </h1>

            {/* Rating */}
            {(product.rating != null || product.review_count != null) && (
              <div className="flex items-center gap-3 mb-5">
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

            {/* Price */}
            <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm mb-6">
              <div className="flex items-end flex-wrap gap-x-3 gap-y-1">
                <span className="text-4xl font-extrabold tracking-tight flex items-start">
                  <IndianRupee className="w-5 h-5 mt-2 mr-0.5 text-primary" />
                  <span className="text-primary">{product.price.toLocaleString("en-IN")}</span>
                </span>
                {product.mrp != null && product.mrp > product.price && (
                  <span className="text-xl text-muted-foreground line-through mb-1">
                    ₹{product.mrp.toLocaleString("en-IN")}
                  </span>
                )}
                {product.discount_percent != null && product.discount_percent > 0 && (
                  <span className="text-xl font-bold text-emerald-600 mb-1">
                    {product.discount_percent}% off
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {inStock
                  ? "Price may change — use coupons & affiliate offers at checkout"
                  : "Currently unavailable — check the store for equivalents"}
                {product.sku && <span className="ml-2">· Ref: {product.sku}</span>}
              </p>
            </div>

            {/* CTA */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                size="lg"
                disabled={!inStock}
                className={`flex-1 gap-2 text-base h-14 rounded-xl font-bold shadow-md ${
                  inStock
                    ? "bg-primary hover:bg-primary/90"
                    : "bg-muted text-muted-foreground cursor-not-allowed"
                }`}
                onClick={() => window.open(product.affiliate_link, "_blank")}
              >
                {inStock ? `Buy on ${sourceLabel}` : "Currently Unavailable"}
                <ExternalLink className="w-5 h-5" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="flex-1 gap-2 text-base h-14 rounded-xl font-semibold"
                onClick={() => window.open(product.affiliate_link, "_blank")}
              >
                View Full Deal <Sparkles className="w-5 h-5 text-amber-500" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Below the fold sections ────────────────────────────── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-14 space-y-10">
        <SectionCard
          title="Description"
          icon="✨"
        >
          {product.description ? (
            <div className="rounded-2xl border border-border/40 bg-gradient-to-br from-primary/[0.04] to-transparent px-5 sm:px-7 py-5 sm:py-6">
              <p className="text-[15px] sm:text-base text-foreground/80 leading-[1.85] whitespace-pre-line first-letter:text-3xl first-letter:font-bold first-letter:text-primary first-letter:pr-1">
                {product.description}
              </p>
            </div>
          ) : (
            <p className="text-muted-foreground italic">
              No description provided for this product.
            </p>
          )}
        </SectionCard>

        {values.length > 0 && (
          <SectionCard title="Key Features" icon="⭐">
            <ul className="grid sm:grid-cols-2 gap-3">
              {values.map((value, i) => (
                <li
                  key={value.id}
                  className="group flex items-start gap-3.5 rounded-2xl border border-border/50 bg-gradient-to-br from-primary/[0.05] to-transparent hover:from-primary/10 hover:border-primary/30 px-4 py-3.5 transition-all hover:-translate-y-0.5"
                >
                  <span className="shrink-0 w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-xs font-bold group-hover:bg-primary group-hover:text-primary-foreground transition-colors mt-0.5">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="text-sm leading-relaxed text-foreground/85 pt-1">
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
            icon="📋"
            action={
              <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-secondary text-secondary-foreground">
                {product.specs.length} details
              </span>
            }
          >
            <div className="grid sm:grid-cols-2 gap-x-8 gap-y-0">
              {product.specs.map((spec, i) => (
                <div
                  key={i}
                  className="flex items-start justify-between gap-6 py-3 border-b border-border/40 text-sm"
                >
                  <span className="font-medium text-foreground/75 whitespace-nowrap flex items-start gap-2">
                    <span className="w-1.5 h-1.5 mt-1.5 rounded-full bg-primary/50 shrink-0" />
                    {spec.key}
                  </span>
                  <span className="text-muted-foreground text-right max-w-[60%]">
                    {spec.value}
                  </span>
                </div>
              ))}
            </div>
          </SectionCard>
        )}

        {product.reviews && product.reviews.length > 0 && (
          <section id="reviews" className="scroll-mt-24">
            <div className="bg-card border border-border/70 rounded-3xl shadow-sm overflow-hidden">
              {/* Summary band */}
              <div className="grid md:grid-cols-[260px_1fr] divide-y md:divide-y-0 md:divide-x divide-border/50">
                <div className="p-7 flex flex-col items-center justify-center text-center bg-gradient-to-b from-amber-400/[0.08] to-transparent">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                    Average Rating
                  </p>
                  <p className="text-6xl font-extrabold tracking-tight text-amber-500">
                    {product.rating ?? "—"}
                  </p>
                  {product.rating != null && (
                    <div className="mt-2">
                      <Stars value={product.rating} size={20} />
                    </div>
                  )}
                  <p className="text-sm text-muted-foreground mt-3">
                    {product.review_count != null
                      ? `${product.review_count.toLocaleString("en-IN")} verified ratings`
                      : "Buyer verified"}
                  </p>
                </div>

                <div className="p-7">
                  <div className="flex items-center justify-between mb-5">
                    <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
                      What buyers say
                    </h2>
                    <span className="hidden sm:inline-flex text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600">
                      {product.reviews.length} latest reviews
                    </span>
                  </div>
                  <div className="space-y-4">
                    {product.reviews.map((review, i) => (
                      <div
                        key={i}
                        className="group rounded-2xl border border-border/50 bg-background/70 hover:border-primary/30 hover:shadow-md transition-all p-4 sm:p-5"
                      >
                        <div className="flex items-center gap-3 mb-2.5">
                          <span
                            className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-inner"
                            style={avatarStyle((review.author || "A").toUpperCase())}
                          >
                            {(review.author || "A").charAt(0).toUpperCase()}
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold truncate">
                              {review.author || "Verified Buyer"}
                            </p>
                            <div className="flex items-center gap-2">
                              {review.rating != null && (
                                <Stars value={review.rating} size={11} />
                              )}
                              {review.date && (
                                <span className="text-xs text-muted-foreground">
                                  · {review.date}
                                </span>
                              )}
                            </div>
                          </div>
                          {review.rating != null && (
                            <span className="shrink-0 px-2.5 py-1 rounded-lg bg-amber-400/15 text-amber-600 text-xs font-bold">
                              {review.rating}/5
                            </span>
                          )}
                        </div>
                        {review.title && (
                          <p className="font-bold text-[15px] text-foreground/90 mb-1.5">
                            “{review.title}”
                          </p>
                        )}
                        {review.body && (
                          <p className="text-sm text-muted-foreground leading-relaxed">
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
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline mt-6"
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
          <SectionCard
            title="You may also like"
            icon="🛍"
            action={
              <Link
                href={`/products?category=${product.category}`}
                className="text-sm font-semibold text-primary hover:underline"
              >
                View all
              </Link>
            }
          >
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
              {related.map((rel) => (
                <Link
                  key={rel.id}
                  href={`/products/${rel.slug}`}
                  className="group rounded-2xl border border-border/60 bg-card overflow-hidden hover:shadow-xl hover:border-primary/30 hover:-translate-y-1 transition-all"
                >
                  <div className="aspect-square bg-gradient-to-br from-white to-primary/[0.04]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={rel.image_url || "/placeholder.svg"}
                      alt={rel.name}
                      loading="lazy"
                      className="w-full h-full object-contain p-5 group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-4">
                    <p className="text-sm font-medium line-clamp-2 leading-snug min-h-[2.5em]">
                      {rel.name}
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="font-bold text-primary">
                        ₹{rel.price.toLocaleString("en-IN")}
                      </span>
                      {rel.rating != null && (
                        <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                          {rel.rating}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </SectionCard>
        )}
      </div>
    </div>
  );
}
