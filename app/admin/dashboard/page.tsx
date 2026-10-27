"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { getAdminToken } from "@/lib/admin-auth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Plus,
  Package,
  Star,
  Tag,
  ListChecks,
  LayoutGrid,
  Flame,
  Sparkles,
  ShoppingBag,
  MonitorSmartphone,
} from "lucide-react";
import Link from "next/link";

interface Product {
  id: number;
  name: string;
  price: number;
  rating?: number | null;
  category?: string | null;
  source?: string | null;
  home_sections?: string[] | null;
}

export default function AdminOverview() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    const token = getAdminToken();
    if (!token) {
      router.push("/admin/login");
      return;
    }
    setAuthenticated(true);
    (async () => {
      try {
        const supabase = createClient();
        const { data, error: err } = await supabase
          .from("products")
          .select("id, name, price, rating, category, source, home_sections");
        if (err) throw err;
        // stats only — products themselves are managed on the Products page
        setProducts(
          (data ?? []).map(
            (p: Record<string, unknown>) =>
              ({
                id: p.id as number,
                name: p.name as string,
                price: p.price as number,
                rating: p.rating as number | null,
                category: p.category as string | null,
                source: p.source as string | null,
                home_sections: p.home_sections as string[] | null,
              }) as Product,
          ),
        );
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load stats");
      } finally {
        setLoading(false);
      }
    })();
  }, [router]);

  if (!authenticated) return null;

  const avgRating =
    products.filter((p) => p.rating != null).length > 0
      ? (
          products.reduce((s, p) => s + (p.rating ?? 0), 0) /
          products.filter((p) => p.rating != null).length
        ).toFixed(1)
      : "—";

  const placed = products.filter((p) => (p.home_sections ?? []).length > 0);
  const cats = new Set(products.map((p) => p.category?.trim()).filter(Boolean));

  const sectionCounts = [
    { key: "hero", label: "Hero showcase", Icon: Sparkles, count: placed.filter((p) => (p.home_sections ?? []).includes("hero")).length },
    { key: "trending", label: "Trending deals", Icon: Flame, count: placed.filter((p) => (p.home_sections ?? []).includes("trending")).length },
    { key: "fresh", label: "Fresh drops", Icon: ShoppingBag, count: placed.filter((p) => (p.home_sections ?? []).includes("fresh")).length },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
      {/* heading */}
      <div className="mb-7">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
          Overview
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          A quick pulse of your store — manage products on the Products page.
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3.5 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm">
          {error}
        </div>
      )}

      {/* stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
        {[
          {
            Icon: Package,
            label: "Total products",
            value: products.length.toLocaleString("en-IN"),
            tint: "text-primary bg-primary/10",
          },
          {
            Icon: MonitorSmartphone,
            label: "On homepage",
            value: String(placed.length),
            tint: "text-amber-600 bg-amber-400/10",
          },
          {
            Icon: Star,
            label: "Avg. rating",
            value: avgRating,
            tint: "text-emerald-600 bg-emerald-500/10",
          },
          {
            Icon: Tag,
            label: "Categories",
            value: String(cats.size),
            tint: "text-fuchsia-600 bg-fuchsia-500/10",
          },
        ].map((s, i) => (
          <Card key={i} className="p-4 sm:p-5 flex items-center gap-3.5 rounded-2xl">
            <span className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${s.tint}`}>
              <s.Icon className="w-5 h-5" />
            </span>
            <span className="min-w-0">
              <span className="block text-xl sm:text-2xl font-extrabold leading-none tabular-nums">
                {loading ? "…" : s.value}
              </span>
              <span className="block text-[11px] sm:text-xs text-muted-foreground mt-1 truncate">
                {s.label}
              </span>
            </span>
          </Card>
        ))}
      </div>

      {/* homepage placement board */}
      <Card className="rounded-2xl p-5 sm:p-6 mb-6">
        <div className="flex items-center gap-2.5 mb-1.5">
          <span className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <MonitorSmartphone className="w-4.5 h-4.5" />
          </span>
          <div>
            <h2 className="text-[15px] font-bold">Homepage placements</h2>
            <p className="text-xs text-muted-foreground">
              What&apos;s live on the public right now
            </p>
          </div>
        </div>
        {loading ? (
          <div className="py-8 flex justify-center">
            <span className="w-6 h-6 rounded-full border-2 border-primary/25 border-t-primary animate-spin" />
          </div>
        ) : (
          <div className="grid sm:grid-cols-3 gap-3 mt-4">
            {sectionCounts.map(({ key, label, Icon, count }) => (
              <div
                key={key}
                className={`rounded-2xl border-2 p-4 transition-colors ${
                  count > 0
                    ? "border-primary/40 bg-primary/[0.04]"
                    : "border-border/60 bg-secondary/30"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                    <Icon className="w-4 h-4" />
                    {label}
                  </span>
                  <span
                    className={`text-2xl font-extrabold tabular-nums ${
                      count > 0 ? "text-primary" : "text-muted-foreground/40"
                    }`}
                  >
                    {count}
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground mt-2 leading-snug">
                  {count > 0
                    ? `${count} ${count === 1 ? "product is" : "products are"} visible in this section`
                    : "No products here yet — turn the toggle on from Products"}
                </p>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* quick actions */}
      <div className="grid sm:grid-cols-3 gap-3 sm:gap-4">
        <Link href="/admin/dashboard/products" className="group">
          <Card className="p-5 h-full rounded-2xl hover:border-primary/30 hover:shadow-md transition-all duration-300">
            <span className="inline-flex w-11 h-11 rounded-xl bg-primary/10 text-primary items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
              <ListChecks className="w-5 h-5" />
            </span>
            <h3 className="text-[15px] font-bold mt-3.5">Manage Products</h3>
            <p className="text-[13px] text-muted-foreground mt-1.5 leading-relaxed">
              Add, edit, delete and toggle homepage placements — all in one place.
            </p>
            <Button size="sm" className="mt-4 gap-2 rounded-xl font-bold shadow-md shadow-primary/20">
              Open Products
            </Button>
          </Card>
        </Link>
        <Link href="/admin/dashboard/products" className="group">
          <Card className="p-5 h-full rounded-2xl hover:border-primary/30 hover:shadow-md transition-all duration-300">
            <span className="inline-flex w-11 h-11 rounded-xl bg-primary/10 text-primary items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
              <Plus className="w-5 h-5" />
            </span>
            <h3 className="text-[15px] font-bold mt-3.5">Add a Product</h3>
            <p className="text-[13px] text-muted-foreground mt-1.5 leading-relaxed">
              Paste an Amazon / Flipkart / Myntra link and auto-fill everything.
            </p>
            <Button size="sm" className="mt-4 gap-2 rounded-xl font-bold shadow-md shadow-primary/20">
              <Plus className="w-4 h-4" /> New Product
            </Button>
          </Card>
        </Link>
        <Link href="/admin/dashboard/categories" className="group">
          <Card className="p-5 h-full rounded-2xl hover:border-primary/30 hover:shadow-md transition-all duration-300">
            <span className="inline-flex w-11 h-11 rounded-xl bg-primary/10 text-primary items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
              <LayoutGrid className="w-5 h-5" />
            </span>
            <h3 className="text-[15px] font-bold mt-3.5">Categories</h3>
            <p className="text-[13px] text-muted-foreground mt-1.5 leading-relaxed">
              {cats.size} active categor{cats.size === 1 ? "y" : "ies"} — organize
              the storefront.
            </p>
            <Button size="sm" variant="outline" className="mt-4 gap-2 rounded-xl bg-transparent">
              Manage Categories
            </Button>
          </Card>
        </Link>
      </div>
    </div>
  );
}
