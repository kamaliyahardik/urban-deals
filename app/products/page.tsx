"use client";

import React, { Suspense, useMemo, useRef, useState } from "react";
import { useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import DealCard from "@/components/deal-card";
import Breadcrumb from "@/components/breadcrumb";
import { Reveal } from "@/components/page-parts";
import {
  Search,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  Loader2,
  SearchX,
  RotateCcw,
  Star,
} from "lucide-react";

const PAGE_SIZE = 12;

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
  mrp?: number | null;
  discount_percent?: number | null;
  rating?: number | null;
  review_count?: number | null;
  source?: string | null;
  availability?: string | null;
}

interface Category {
  name: string;
  slug: string;
}

interface FilterCategory extends Category {
  count: number;
}

const PRICE_BANDS = [
  { key: "any", label: "Any price" },
  { key: "under500", label: "Under ₹500" },
  { key: "500to1000", label: "₹500 – ₹1,000" },
  { key: "1000to5000", label: "₹1,000 – ₹5,000" },
  { key: "above5000", label: "Above ₹5,000" },
];

const RATINGS = [
  { key: 0, label: "Any" },
  { key: 3.5, label: "3.5★ & up" },
  { key: 4, label: "4.0★ & up" },
  { key: 4.5, label: "4.5★ & up" },
];

const SORTS = [
  { key: "newest", label: "Newest first" },
  { key: "price_asc", label: "Price: low → high" },
  { key: "price_desc", label: "Price: high → low" },
  { key: "rating", label: "Rating: high → low" },
  { key: "discount", label: "Biggest discount" },
];

export default function ProductsPage() {
  return (
    <Suspense fallback={null}>
      <ProductsListing />
    </Suspense>
  );
}

function ProductsListing() {
  const searchParams = useSearchParams();

  const [products, setProducts] = useState<Product[]>([]);
  const [filterCats, setFilterCats] = useState<FilterCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // filters
  const [query, setQuery] = useState("");
  const [selectedCats, setSelectedCats] = useState<string[]>(
    searchParams.get("category") ? [searchParams.get("category") as string] : [],
  );
  const [priceBand, setPriceBand] = useState("any");
  const [minRating, setMinRating] = useState(0);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(1);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const supabase = createClient();
        const [catRes, prodRes] = await Promise.all([
          supabase.from("categories").select("name, slug").order("name", { ascending: true }),
          supabase.from("products").select("*").neq("price", 0),
        ]);
        const list = (prodRes.data || []) as Product[];
        const cats = catRes.data || [];
        const counts: Record<string, number> = {};
        list.forEach((p) => {
          if (p.category) counts[p.category] = (counts[p.category] || 0) + 1;
        });
        setProducts(list);
        setFilterCats(
          cats
            .map((c: Category) => ({ ...c, count: counts[c.slug] || 0 }))
            .filter((c: FilterCategory) => c.count > 0),
        );
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load products");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // reset to page 1 whenever any filter changes
  useEffect(() => {
    setPage(1);
  }, [query, selectedCats, priceBand, minRating, inStockOnly, sort]);

  const filtered = useMemo(() => {
    let list = [...products];

    if (query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          (p.description || "").toLowerCase().includes(q) ||
          (p.category || "").toLowerCase().includes(q),
      );
    }
    if (selectedCats.length > 0) {
      list = list.filter((p) => p.category && selectedCats.includes(p.category));
    }
    list = list.filter((p) => {
      switch (priceBand) {
        case "under500":
          return p.price < 500;
        case "500to1000":
          return p.price >= 500 && p.price <= 1000;
        case "1000to5000":
          return p.price > 1000 && p.price <= 5000;
        case "above5000":
          return p.price > 5000;
        default:
          return true;
      }
    });
    if (minRating > 0) list = list.filter((p) => (p.rating ?? 0) >= minRating);
    if (inStockOnly) list = list.filter((p) => p.availability !== "Out of Stock");

    switch (sort) {
      case "price_asc":
        list.sort((a, b) => a.price - b.price);
        break;
      case "price_desc":
        list.sort((a, b) => b.price - a.price);
        break;
      case "rating":
        list.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
        break;
      case "discount":
        list.sort((a, b) => (b.discount_percent ?? 0) - (a.discount_percent ?? 0));
        break;
      default:
        list.sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
        );
    }
    return list;
  }, [products, query, selectedCats, priceBand, minRating, inStockOnly, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const toggleCat = (slug: string) =>
    setSelectedCats((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug],
    );

  const clearAll = () => {
    setQuery("");
    setSelectedCats([]);
    setPriceBand("any");
    setMinRating(0);
    setInStockOnly(false);
    setSort("newest");
  };

  const activeFilterCount =
    selectedCats.length +
    (priceBand !== "any" ? 1 : 0) +
    (minRating > 0 ? 1 : 0) +
    (inStockOnly ? 1 : 0) +
    (query.trim() ? 1 : 0);

  const goToPage = (p: number) => {
    setPage(Math.min(Math.max(1, p), totalPages));
    gridRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // page numbers around current
  const pageNumbers = useMemo(() => {
    const span = Math.min(totalPages, 5);
    let start = Math.max(1, page - Math.floor(span / 2));
    const end = start + span - 1;
    if (end > totalPages) {
      start = Math.max(1, totalPages - span + 1);
    }
    return Array.from({ length: span }, (_, i) => start + i);
  }, [page, totalPages]);

  const activeCatNames = filterCats
    .filter((c) => selectedCats.includes(c.slug))
    .map((c) => c.name);

  return (
    <div className="min-h-screen bg-background pt-24 pb-16 px-3 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Breadcrumb */}
        <div className="flex justify-center mb-6">
          <Breadcrumb items={[{ label: "Products" }]} />
        </div>

        {/* Header */}
        <header className="mb-7">
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-3">
            Every deal on the{" "}
            <span className="bg-gradient-to-r from-primary via-violet-400 to-primary bg-clip-text text-transparent">
              shelf.
            </span>
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground max-w-2xl leading-relaxed">
            Browse everything we&apos;ve curated so far — search it, filter it,
            sort it. 12 deals per page, straight to the good stuff.
          </p>
        </header>

        {/* Search + sort bar */}
        <div className="rounded-2xl border border-border/60 bg-card/90 backdrop-blur px-3 sm:px-4 py-2.5 shadow-sm flex items-center gap-2.5">
          <span className="shrink-0 w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <Search className="w-4.5 h-4.5" />
          </span>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search deals — try “watch”, “speaker”, anything…"
            className="flex-1 min-w-0 bg-transparent outline-none text-sm sm:text-[15px] font-medium placeholder:text-muted-foreground/70"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label="Clear search"
              className="shrink-0 p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}

          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            aria-label="Sort deals"
            className="hidden sm:block shrink-0 rounded-xl bg-secondary text-foreground text-xs font-bold px-3 py-2.5 outline-none cursor-pointer border border-border/50"
          >
            {SORTS.map((s) => (
              <option key={s.key} value={s.key}>
                {s.label}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={() => setMobileFiltersOpen((v) => !v)}
            className={`lg:hidden shrink-0 inline-flex items-center gap-1.5 rounded-xl px-3 py-2.5 text-xs font-bold border transition-colors ${
              mobileFiltersOpen
                ? "bg-primary text-white border-primary"
                : "bg-secondary text-foreground border-border/50"
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filters
            {activeFilterCount > 0 && (
              <span
                className={`px-1.5 rounded-full text-[10px] ${
                  mobileFiltersOpen ? "bg-white/20" : "bg-primary text-white"
                }`}
              >
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>

        <div className="grid lg:grid-cols-[248px_1fr] gap-6 mt-6 items-start">
          {/* ── Filter sidebar ─────────────────────────────── */}
          <aside
            className={`${
              mobileFiltersOpen ? "block" : "hidden"
            } lg:block w-full lg:sticky lg:top-28`}
          >
            <div className="rounded-3xl border border-border/60 bg-card p-4 sm:p-5 space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="inline-flex items-center gap-2 font-extrabold text-[15px]">
                  <SlidersHorizontal className="w-4 h-4 text-primary" />
                  Filters
                  {activeFilterCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-primary text-white text-[10px] font-bold">
                      {activeFilterCount}
                    </span>
                  )}
                </h2>
                <button
                  type="button"
                  onClick={clearAll}
                  className="text-[11px] font-bold text-primary hover:text-primary/70 transition-colors"
                >
                  Clear all
                </button>
              </div>

              {/* categories */}
              <div>
                <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-2.5">
                  Category
                </p>
                <div className="space-y-0.5">
                  {filterCats.length === 0 && !loading && (
                    <p className="text-xs text-muted-foreground">No categories yet</p>
                  )}
                  {filterCats.map((c) => {
                    const checked = selectedCats.includes(c.slug);
                    return (
                      <button
                        key={c.slug}
                        type="button"
                        onClick={() => toggleCat(c.slug)}
                        aria-pressed={checked}
                        className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-[13px] font-medium transition-colors ${
                          checked
                            ? "bg-primary/10 text-primary"
                            : "text-foreground/80 hover:bg-secondary"
                        }`}
                      >
                        <span
                          className={`shrink-0 w-4 h-4 rounded-[5px] border-2 flex items-center justify-center transition-colors ${
                            checked ? "bg-primary border-primary" : "border-border"
                          }`}
                        >
                          {checked && (
                            <svg viewBox="0 0 10 8" className="w-2.5 h-2 fill-none stroke-white stroke-[1.8]">
                              <path d="M1 4l2.5 2.5L9 1" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          )}
                        </span>
                        <span className="truncate text-left">{c.name}</span>
                        <span className="ml-auto text-[10px] font-bold text-muted-foreground">
                          {c.count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* price */}
              <div>
                <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-2.5">
                  Price
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {PRICE_BANDS.map((b) => (
                    <button
                      key={b.key}
                      type="button"
                      onClick={() => setPriceBand(b.key)}
                      className={`px-3 py-1.5 rounded-full text-[11px] font-bold border transition-colors ${
                        priceBand === b.key
                          ? "bg-primary text-white border-primary"
                          : "bg-background border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"
                      }`}
                    >
                      {b.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* rating */}
              <div>
                <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-2.5">
                  Rating
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {RATINGS.map((r) => (
                    <button
                      key={r.key}
                      type="button"
                      onClick={() => setMinRating(r.key)}
                      className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-[11px] font-bold border transition-colors ${
                        minRating === r.key
                          ? "bg-primary text-white border-primary"
                          : "bg-background border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"
                      }`}
                    >
                      {r.key > 0 && (
                        <Star
                          className={`w-3 h-3 ${
                            minRating === r.key ? "fill-white" : "fill-amber-400 text-amber-400"
                          }`}
                        />
                      )}
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* availability */}
              <div>
                <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-2.5">
                  Availability
                </p>
                <button
                  type="button"
                  role="switch"
                  aria-checked={inStockOnly}
                  onClick={() => setInStockOnly((v) => !v)}
                  className="w-full flex items-center justify-between gap-3 px-2.5 py-2 rounded-xl hover:bg-secondary transition-colors"
                >
                  <span className="text-[13px] font-medium text-foreground/80">
                    In stock only
                  </span>
                  <span
                    className={`shrink-0 w-9 h-5 rounded-full flex items-center px-0.5 transition-colors ${
                      inStockOnly ? "bg-primary" : "bg-border"
                    }`}
                  >
                    <span
                      className={`w-4 h-4 rounded-full bg-white shadow transition-transform ${
                        inStockOnly ? "translate-x-4" : "translate-x-0"
                      }`}
                    />
                  </span>
                </button>
              </div>
            </div>

            {/* close (mobile) */}
            <button
              type="button"
              onClick={() => setMobileFiltersOpen(false)}
              className="lg:hidden w-full mt-3 py-3 rounded-2xl border border-border bg-card text-sm font-bold text-primary"
            >
              Show results
            </button>
          </aside>

          {/* ── Results ────────────────────────────────────── */}
          <div ref={gridRef} className="scroll-mt-28 min-w-0">
            {/* result summary */}
            <div className="flex flex-wrap items-center gap-2 mb-5">
              <p className="text-sm font-semibold text-foreground/80">
                {loading ? "Loading…" : `${filtered.length} deal${filtered.length === 1 ? "" : "s"} found`}
              </p>
              {!loading && (
                <span className="text-xs text-muted-foreground">
                  · page {page} of {totalPages}
                </span>
              )}

              {/* active filter chips */}
              {activeCatNames.map((name) => (
                <span
                  key={name}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-[11px] font-bold"
                >
                  {name}
                </span>
              ))}
              {minRating > 0 && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-[11px] font-bold">
                  {minRating}★ & up
                </span>
              )}
              {inStockOnly && (
                <span className="px-2.5 py-1 rounded-full bg-primary/10 text-primary text-[11px] font-bold">
                  In stock
                </span>
              )}
            </div>

            {/* loading */}
            {loading && (
              <div className="flex justify-center items-center py-24 gap-3">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <span className="text-muted-foreground text-sm">Loading the shelf…</span>
              </div>
            )}

            {/* error */}
            {error && !loading && (
              <div className="bg-destructive/10 border border-destructive/20 rounded-2xl p-5 text-destructive text-sm font-medium">
                {error}
              </div>
            )}

            {/* empty state */}
            {!loading && !error && filtered.length === 0 && (
              <div className="rounded-3xl border border-border/60 bg-card py-16 px-6 text-center">
                <span className="inline-flex w-14 h-14 rounded-2xl bg-secondary text-primary items-center justify-center mb-5">
                  <SearchX className="w-7 h-7" />
                </span>
                <h2 className="text-lg font-extrabold">No deals match those filters</h2>
                <p className="text-sm text-muted-foreground mt-2 max-w-sm mx-auto">
                  Try clearing a filter or two — the shelf has more to show.
                </p>
                <button
                  type="button"
                  onClick={clearAll}
                  className="inline-flex items-center gap-2 mt-6 rounded-xl bg-primary text-white px-6 py-3 text-sm font-bold shadow-lg shadow-primary/25 hover:bg-primary/90 transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                  Clear all filters
                </button>
              </div>
            )}

            {/* grid — compact cards */}
            {!loading && !error && filtered.length > 0 && (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
                  {pageItems.map((p, i) => (
                    <DealCard key={p.id} product={p} delay={i * 50} compact />
                  ))}
                </div>

                {/* pagination */}
                {totalPages > 1 && (
                  <nav
                    aria-label="Pagination"
                    className="flex items-center justify-center gap-1.5 mt-10"
                  >
                    <button
                      type="button"
                      onClick={() => goToPage(page - 1)}
                      disabled={page === 1}
                      aria-label="Previous page"
                      className="p-2.5 rounded-xl border border-border bg-card text-muted-foreground hover:text-primary hover:border-primary/40 transition-colors disabled:opacity-40 disabled:pointer-events-none"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    {pageNumbers.map((n) => (
                      <button
                        key={n}
                        type="button"
                        onClick={() => goToPage(n)}
                        aria-current={n === page ? "page" : undefined}
                        className={`min-w-[2.5rem] h-10 px-2 rounded-xl text-sm font-bold transition-colors ${
                          n === page
                            ? "bg-primary text-white shadow-md shadow-primary/25"
                            : "bg-card border border-border text-muted-foreground hover:text-primary hover:border-primary/40"
                        }`}
                      >
                        {n}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => goToPage(page + 1)}
                      disabled={page === totalPages}
                      aria-label="Next page"
                      className="p-2.5 rounded-xl border border-border bg-card text-muted-foreground hover:text-primary hover:border-primary/40 transition-colors disabled:opacity-40 disabled:pointer-events-none"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </nav>
                )}
              </>
            )}

            {/* legal touch */}
            {!loading && filtered.length > 0 && (
              <Reveal className="mt-10">
                <p className="text-[11px] text-muted-foreground text-center leading-relaxed max-w-xl mx-auto">
                  Prices shown were verified at the time of listing and can change
                  on the store — always confirm the final price on the product page
                  before buying.
                </p>
              </Reveal>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
