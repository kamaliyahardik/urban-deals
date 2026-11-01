import type { Metadata } from "next";
import { getSiteUrl } from "@/lib/site";
import ProductDetailClient from "./detail";

/* ------------------------------ data -------------------------------- */

const REST_BASE = process.env.NEXT_PUBLIC_SUPABASE_URL;
const REST_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

interface ProductRow {
  name: string;
  slug: string;
  description: string | null;
  price: number;
  mrp: number | null;
  discount_percent: number | null;
  currency: string | null;
  brand: string | null;
  sku: string | null;
  rating: number | null;
  review_count: number | null;
  availability: string | null;
  image_url: string | null;
  images: string[] | null;
  category: string | null;
  source: string | null;
  specs: { key: string; value: string }[] | null;
  reviews: {
    author: string;
    rating: number | null;
    title: string;
    body: string;
    date: string | null;
  }[] | null;
}

interface CategoryRow {
  slug: string;
  name: string;
}

function restHeaders(): HeadersInit {
  return {
    apikey: REST_KEY as string,
    Authorization: `Bearer ${REST_KEY}`,
  };
}

async function getProduct(slug: string): Promise<ProductRow | null> {
  if (!REST_BASE || !REST_KEY) return null;
  try {
    const res = await fetch(
      `${REST_BASE}/rest/v1/products?slug=eq.${encodeURIComponent(slug)}&select=name,slug,description,price,mrp,discount_percent,currency,brand,sku,rating,review_count,availability,image_url,images,category,source,specs,reviews&limit=1`,
      { headers: restHeaders(), cache: "no-store" },
    );
    if (!res.ok) return null;
    const rows = (await res.json()) as ProductRow[];
    return rows[0] ?? null;
  } catch {
    return null;
  }
}

async function getCategoryName(slug: string): Promise<string | null> {
  if (!REST_BASE || !REST_KEY) return null;
  try {
    const res = await fetch(
      `${REST_BASE}/rest/v1/categories?slug=eq.${encodeURIComponent(slug)}&select=slug,name&limit=1`,
      { headers: restHeaders(), cache: "no-store" },
    );
    if (!res.ok) return null;
    const rows = (await res.json()) as CategoryRow[];
    return rows[0]?.name ?? null;
  } catch {
    return null;
  }
}

/* ------------------------------ helpers ------------------------------ */

/** Drop slash/dash-separated model variants that bloat Amazon product names. */
function cleanName(name: string): string {
  return name
    .replace(/\s*\/\s*[A-Za-z0-9-]{4,}.*$/, "")
    .replace(/\s+-\s+(?:[A-Z0-9][A-Za-z0-9-]*\/?)+\s*$/, "")
    .trim();
}

/** Clip to `max` characters on a word boundary — never mid-word. */
function clipOnWord(text: string, max: number): string {
  if (text.length <= max) return text;
  const head = text.slice(0, max + 1);
  const cut = head.lastIndexOf(" ");
  return (cut > 0 ? head.slice(0, cut) : text.slice(0, max))
    .replace(/[\s,;:.—–-]+$/, "");
}

function buildDescription(p: ProductRow): string {
  const off =
    p.discount_percent != null && p.discount_percent > 0
      ? ` (${p.discount_percent}% off)`
      : "";
  const pricePart = ` at ₹${p.price.toLocaleString("en-IN")}${off}`;
  const suffix =
    " — real buyer reviews, live price & honest verdict from Urban Deals. Compare & grab the deal now.";
  const lead = clipOnWord(cleanName(p.name), Math.max(24, 160 - suffix.length - pricePart.length));
  return `${lead}${pricePart}${suffix}`;
}

function absoluteImage(url: string): string {
  if (/^https?:\/\//i.test(url)) return url;
  return `${getSiteUrl()}${url.startsWith("/") ? "" : "/"}${url}`;
}

function isOutOfStock(availability: string | null): boolean {
  const a = (availability || "").toLowerCase().replace(/[\s_-]/g, "");
  return a === "outofstock" || a === "unavailable";
}

/* ------------------------------ schema ------------------------------- */

type Schema = Record<string, unknown>;

function buildProductSchema(p: ProductRow): Schema | null {
  if (!(p.price > 0)) return null;

  const images = (
    p.images && p.images.length > 0 ? p.images : p.image_url ? [p.image_url] : []
  )
    .filter((u): u is string => Boolean(u))
    .map(absoluteImage);

  const schema: Schema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: p.name,
    description: p.description ? p.description.slice(0, 150) : p.name,
    offers: {
      "@type": "Offer",
      url: `${getSiteUrl()}/products/${p.slug}`,
      price: p.price,
      priceCurrency: p.currency || "INR",
      availability: isOutOfStock(p.availability)
        ? "https://schema.org/OutOfStock"
        : "https://schema.org/InStock",
      itemCondition: "https://schema.org/NewCondition",
    },
  };
  if (images.length > 0) schema.image = images;
  if (p.brand || p.source) {
    schema.brand = { "@type": "Brand", name: p.brand || p.source };
  }
  if (p.sku) schema.sku = p.sku;
  if (p.rating != null && p.rating > 0 && p.review_count != null && p.review_count > 0) {
    schema.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: p.rating,
      reviewCount: p.review_count,
    };
  }
  if (p.reviews && p.reviews.length > 0) {
    const reviews = p.reviews
      .filter((r) => (r.title && r.title.trim()) || (r.body && r.body.trim()))
      .slice(0, 5)
      .map((r) => ({
        "@type": "Review",
        author: { "@type": "Person", name: r.author },
        reviewRating: {
          "@type": "Rating",
          ratingValue: r.rating ?? 5,
          bestRating: 5,
        },
        headLine: r.title,
        reviewBody: r.body,
      }));
    if (reviews.length > 0) schema.review = reviews;
  }
  return schema;
}

function buildBreadcrumbSchema(
  p: ProductRow,
  categoryName: string | null,
): Schema | null {
  const site = getSiteUrl();
  const items: { position: number; name: string; item?: string }[] = [
    { position: 1, name: "Home", item: site },
    { position: 2, name: "Products", item: `${site}/products` },
  ];
  if (p.category) {
    items.push({
      position: 3,
      name: categoryName || p.category,
      item: `${site}/category/${p.category}`,
    });
  }
  items.push({ position: items.length + 1, name: p.name });
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((i) => ({
      "@type": "ListItem",
      position: i.position,
      name: i.name,
      ...(i.item ? { item: i.item } : {}),
    })),
  };
}

/* ------------------------------ meta --------------------------------- */

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product || !(product.price > 0)) {
    return { robots: { index: false, follow: false } };
  }

  const title = clipOnWord(cleanName(product.name), 62);
  const description = buildDescription(product);

  return {
    title,
    description,
    alternates: { canonical: `/products/${slug}` },
    robots: { index: true, follow: true },
    openGraph: {
      type: "website",
      title,
      description,
    },
  };
}

/* ------------------------------ page --------------------------------- */

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProduct(slug);
  const categoryName = product?.category
    ? await getCategoryName(product.category)
    : null;

  const productSchema = product ? buildProductSchema(product) : null;
  const breadcrumbSchema = product
    ? buildBreadcrumbSchema(product, categoryName)
    : null;

  return (
    <>
      {productSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
        />
      )}
      {breadcrumbSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
        />
      )}
      <ProductDetailClient />
    </>
  );
}
