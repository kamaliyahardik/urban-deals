import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site";

const REST_BASE = process.env.NEXT_PUBLIC_SUPABASE_URL;
const REST_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const SITE = getSiteUrl();

interface Row {
  slug: string;
  updated_at?: string | null;
}

async function fetchSlugs(table: string): Promise<Row[]> {
  if (!REST_BASE || !REST_KEY) return [];
  try {
    const res = await fetch(`${REST_BASE}/rest/v1/${table}?select=slug,updated_at`, {
      headers: {
        apikey: REST_KEY,
        Authorization: `Bearer ${REST_KEY}`,
      },
      cache: "no-store",
    });
    if (!res.ok) return [];
    return (await res.json()) as Row[];
  } catch {
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const statics: MetadataRoute.Sitemap = [
    { path: "", priority: 1, changeFrequency: "daily" as const },
    { path: "/products", priority: 0.9, changeFrequency: "daily" as const },
    { path: "/diwali", priority: 0.9, changeFrequency: "daily" as const },
    { path: "/about", priority: 0.7, changeFrequency: "monthly" as const },
    { path: "/contact", priority: 0.7, changeFrequency: "monthly" as const },
    { path: "/privacy", priority: 0.3, changeFrequency: "yearly" as const },
    { path: "/disclaimer", priority: 0.3, changeFrequency: "yearly" as const },
    { path: "/terms", priority: 0.3, changeFrequency: "yearly" as const },
  ].map(({ path, priority, changeFrequency }) => ({
    url: `${SITE}${path}`,
    lastModified: new Date(),
    changeFrequency,
    priority,
  }));

  const [categories, products] = await Promise.all([
    fetchSlugs("categories"),
    fetchSlugs("products"),
  ]);

  return [
    ...statics,
    ...categories.map((c) => ({
      url: `${SITE}/category/${c.slug}`,
      lastModified: c.updated_at ? new Date(c.updated_at) : new Date(),
      changeFrequency: "daily" as const,
      priority: 0.8,
    })),
    ...products.map((p) => ({
      url: `${SITE}/products/${p.slug}`,
      lastModified: p.updated_at ? new Date(p.updated_at) : new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.6,
    })),
  ];
}
