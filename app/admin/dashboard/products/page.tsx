"use client";

import React, { Fragment, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { getAdminToken } from "@/lib/admin-auth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SectionToggles } from "@/components/admin/section-toggles";
import { AutoFetchBar } from "@/components/admin/auto-fetch-bar";
import type { ProductDraft } from "@/lib/product-fetcher";
import {
  Plus,
  Edit2,
  Trash2,
  Loader2,
  Search,
  Star,
  ArrowUpRight,
  X,
  Flame,
  Sparkles,
  PackageOpen,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";

/* ------------------------------ Types ------------------------------ */

interface Product {
  id: number;
  name: string;
  slug?: string | null;
  description?: string | null;
  price: number;
  category?: string | null;
  image_url?: string | null;
  affiliate_link?: string | null;
  rating?: number | null;
  review_count?: number | null;
  source?: string | null;
  created_at: string;
  home_sections?: string[] | null;
}

interface Category {
  id: number;
  name: string;
  slug: string;
}

interface FeatureValue {
  id: number;
  value_text: string;
}

/* ------------------------- Product form modal ----------------------- */

function ProductFormModal({
  mode,
  product,
  categories,
  onClose,
  onSaved,
}: {
  mode: "add" | "edit";
  product?: Product | null;
  categories: Category[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: product?.name ?? "",
    description: product?.description ?? "",
    price: product?.price != null ? String(product.price) : "",
    category: product?.category ?? categories[0]?.slug ?? "",
    affiliate_link: product?.affiliate_link ?? "",
    image_url: product?.image_url ?? "",
  });
  const [features, setFeatures] = useState<string[]>([""]); // add mode
  const [existingValues, setExistingValues] = useState<FeatureValue[]>([]); // edit mode
  const [newValues, setNewValues] = useState<string[]>([""]); // edit mode
  const [homeSections, setHomeSections] = useState<string[]>(
    product?.home_sections ?? [],
  );
  const [extras, setExtras] = useState<Record<string, unknown>>({});

  // For edit: load the product's existing feature values
  useEffect(() => {
    if (mode === "edit" && product) {
      (async () => {
        const supabase = createClient();
        const { data } = await supabase
          .from("product_values")
          .select("id, value_text")
          .eq("product_id", product.id);
        setExistingValues((data ?? []) as FeatureValue[]);
      })();
    }
  }, [mode, product]);

  const handleFetchFilled = (draft: ProductDraft) => {
    setForm((prev) => ({
      ...prev,
      name: draft.name || prev.name,
      description: draft.description || prev.description,
      price: draft.price != null ? String(draft.price) : prev.price,
      image_url: draft.image_url || prev.image_url,
      affiliate_link: draft.canonical_url || prev.affiliate_link,
      // Auto-select the detected category only when it exists in our DB
      // categories — otherwise keep the admin's current selection.
      category:
        draft.category && categories.some((c) => c.slug === draft.category)
          ? draft.category
          : prev.category,
    }));
    setExtras({
      mrp: draft.mrp ?? null,
      discount_percent: draft.discount_percent ?? null,
      currency: draft.currency || "INR",
      brand: draft.brand ?? "",
      sku: draft.sku ?? "",
      source: draft.source ?? "",
      rating: draft.rating ?? null,
      review_count: draft.review_count ?? null,
      availability: draft.availability ?? "",
      images: draft.images ?? [],
      specs: draft.specs ?? [],
      reviews: draft.reviews ?? [],
    });
    const fetched = draft.features.filter((f) => f.trim());
    setFeatures(fetched.length ? fetched : [""]);
  };

  const handleValueChange = (index: number, value: string) => {
    const arr = [...features];
    arr[index] = value;
    setFeatures(arr);
  };

  const handleNewValueChange = (index: number, value: string) => {
    const arr = [...newValues];
    arr[index] = value;
    setNewValues(arr);
  };

  const deleteExistingValue = async (valueId: number) => {
    if (!product) return;
    try {
      const supabase = createClient();
      await supabase.from("product_values").delete().eq("id", valueId);
      setExistingValues((prev) => prev.filter((v) => v.id !== valueId));
    } catch {
      /* silent */
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      const supabase = createClient();

      if (mode === "add") {
        const priceNumber = Number(form.price);
        if (!form.name.trim() || isNaN(priceNumber)) {
          throw new Error("Name and a valid price are required.");
        }

        // unique slug
        let slug = form.name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-+|-+$/g, "");
        const baseSlug = slug;
        let suffix = 2;
        // eslint-disable-next-line no-constant-condition
        while (true) {
          const { data: existing } = await supabase
            .from("products")
            .select("id")
            .eq("slug", slug)
            .maybeSingle();
          if (!existing) break;
          slug = `${baseSlug}-${suffix++}`;
        }

        const { data: created, error: insertError } = await supabase
          .from("products")
          .insert([
            {
              name: form.name.trim(),
              description: form.description,
              price: priceNumber,
              category: form.category,
              affiliate_link: form.affiliate_link,
              image_url: form.image_url,
              slug,
              home_sections: homeSections,
              ...extras,
            },
          ])
          .select()
          .single();
        if (insertError) throw insertError;
        if (!created) {
          throw new Error(
            "Create failed — database is blocking writes. Run scripts/update-schema-4-rls.sql in Supabase SQL editor.",
          );
        }

        const valuesToInsert = features
          .filter((v) => v.trim())
          .map((v) => ({ product_id: created.id, value_text: v }));
        if (valuesToInsert.length) {
          const { error: valuesError } = await supabase
            .from("product_values")
            .insert(valuesToInsert);
          if (valuesError) throw valuesError;
        }
      } else {
        // edit
        const { data: updated, error: updateError } = await supabase
          .from("products")
          .update({
            name: form.name.trim(),
            description: form.description,
            price: Number(form.price),
            category: form.category,
            affiliate_link: form.affiliate_link,
            image_url: form.image_url,
            home_sections: homeSections,
            ...extras,
            updated_at: new Date().toISOString(),
          })
          .eq("id", product!.id)
          .select("id");
        if (updateError) throw updateError;
        if (!updated || updated.length === 0) {
          throw new Error(
            "Save failed — database is blocking writes. Run scripts/update-schema-4-rls.sql in Supabase SQL editor.",
          );
        }

        const valuesToInsert = newValues
          .filter((v) => v.trim())
          .map((v) => ({ product_id: Number(product!.id), value_text: v }));
        if (valuesToInsert.length) {
          const { error: valuesError } = await supabase
            .from("product_values")
            .insert(valuesToInsert);
          if (valuesError) throw valuesError;
        }
      }

      onSaved();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong. Try again.",
      );
    } finally {
      setSaving(false);
    }
  };

  const inputCls =
    "w-full px-4 py-2.5 rounded-xl border border-border bg-background/80 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/60 transition";

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-6">
      {/* backdrop */}
      <div
        aria-hidden="true"
        onClick={onClose}
        className="absolute inset-0 bg-zinc-950/40 backdrop-blur-sm animate-in fade-in duration-300"
      />

      <Card className="relative w-full max-w-2xl bg-card border border-border/70 shadow-2xl rounded-t-3xl sm:rounded-3xl animate-in fade-in slide-in-from-bottom-6 duration-300 flex flex-col max-h-[92vh]">
        {/* header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border/60 shrink-0">
          <div>
            <h2 className="text-lg font-extrabold tracking-tight">
              {mode === "add" ? "Add New Product" : "Edit Product"}
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              {mode === "add"
                ? "Paste a link to auto-fill, or type manually."
                : "Update details, features or homepage placement."}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="p-2 rounded-xl bg-secondary hover:bg-secondary/80 transition active:scale-90"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* body — NOTE: AutoFetchBar must live OUTSIDE the product form.
            A nested <form> gets dropped by the browser, which made the
            "Fetch Details" button submit the product form instead. */}
        <div className="overflow-y-auto px-6 py-5 space-y-6 [scrollbar-width:thin]">
          <AutoFetchBar onFilled={handleFetchFilled} />

          <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm">
              {error}
            </div>
          )}

          {/* basic fields */}
          <div className="space-y-3.5">
            <div>
              <label className="block text-sm font-semibold mb-1.5">
                Product Name *
              </label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className={inputCls}
                placeholder="Enter product name"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1.5">
                Description
              </label>
              <textarea
                rows={3}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className={`${inputCls} resize-none`}
                placeholder="Short description shown on the product page"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-sm font-semibold mb-1.5">
                  Price *
                </label>
                <input
                  type="number"
                  required
                  step="0.01"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  className={inputCls}
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1.5">
                  Category
                </label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className={inputCls}
                >
                  {categories.length > 0 ? (
                    categories.map((c) => (
                      <option key={c.id} value={c.slug}>
                        {c.name}
                      </option>
                    ))
                  ) : (
                    <option value="">No categories yet</option>
                  )}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1.5">
                Image URL
              </label>
              <input
                type="url"
                value={form.image_url}
                onChange={(e) => setForm({ ...form, image_url: e.target.value })}
                className={inputCls}
                placeholder="https://example.com/image.jpg"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1.5">
                Product / Affiliate Link
              </label>
              <input
                type="url"
                value={form.affiliate_link}
                onChange={(e) => setForm({ ...form, affiliate_link: e.target.value })}
                className={inputCls}
                placeholder="Amazon / Flipkart / Myntra link"
              />
            </div>
          </div>

          {/* Features */}
          <div className="pt-4 border-t border-border/60">
            <h3 className="text-sm font-bold mb-3">Key features</h3>

            {mode === "edit" && existingValues.length > 0 && (
              <div className="space-y-2 mb-4">
                {existingValues.map((v) => (
                  <div
                    key={v.id}
                    className="flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-xl bg-secondary/60 text-sm"
                  >
                    <span className="line-clamp-1">{v.value_text}</span>
                    <button
                      type="button"
                      onClick={() => deleteExistingValue(v.id)}
                      className="text-xs font-bold text-destructive hover:underline shrink-0"
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            )}
            <div className="space-y-2.5 mb-2">
              {(mode === "add" ? features : newValues).map((value, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={value}
                    onChange={(e) =>
                      mode === "add"
                        ? handleValueChange(index, e.target.value)
                        : handleNewValueChange(index, e.target.value)
                    }
                    className={inputCls}
                    placeholder="Enter a key feature"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const arr =
                        mode === "add" ? [...features] : [...newValues];
                      arr.splice(index, 1);
                      mode === "add"
                        ? setFeatures(arr)
                        : setNewValues(arr);
                    }}
                    className="px-3 rounded-xl bg-destructive/10 text-destructive hover:bg-destructive/20 transition text-sm font-bold shrink-0"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={() =>
                mode === "add"
                  ? setFeatures([...features, ""])
                  : setNewValues([...newValues, ""])
              }
              className="text-primary hover:underline text-sm font-semibold"
            >
              + Add Another Feature
            </button>
          </div>

          {/* Homepage placement */}
          <div className="pt-4 border-t border-border/60">
            <h3 className="text-sm font-bold mb-1">Homepage sections</h3>
            <p className="text-xs text-muted-foreground mb-3">
              Where should this product appear? (Nothing = list page only.)
            </p>
            <SectionToggles value={homeSections} onChange={setHomeSections} />
          </div>

          {/* footer actions */}
          <div className="flex gap-3 pt-2 pb-1">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 rounded-xl bg-transparent"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={saving}
              className="flex-1 rounded-xl font-bold shadow-md shadow-primary/20"
            >
              {saving && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              {mode === "add" ? "Create Product" : "Save Changes"}
            </Button>
          </div>
          </form>
        </div>
      </Card>
    </div>
  );
}

/* ------------------------------ Products page ------------------------------ */

const PAGE_SIZE = 25;

export default function AdminProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [authenticated, setAuthenticated] = useState(false);
  const [query, setQuery] = useState("");
  const [sectionFilter, setSectionFilter] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const [modal, setModal] = useState<
    { mode: "add"; product: null } | { mode: "edit"; product: Product } | null
  >(null);

  useEffect(() => {
    const token = getAdminToken();
    if (!token) {
      router.push("/admin/login");
      return;
    }
    setAuthenticated(true);
    fetchData();
  }, [router]);

  const fetchData = async () => {
    try {
      const supabase = createClient();
      const [productsRes, catsRes] = await Promise.all([
        supabase.from("products").select("*").order("created_at", { ascending: false }),
        supabase.from("categories").select("*").order("name", { ascending: true }),
      ]);
      if (productsRes.error) throw productsRes.error;
      setProducts(productsRes.data || []);
      setCategories(catsRes.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    try {
      const supabase = createClient();
      await supabase.from("product_values").delete().eq("product_id", id);
      await supabase.from("reviews").delete().eq("product_id", id);
      const { data: deleted, error: err } = await supabase
        .from("products")
        .delete()
        .eq("id", id)
        .select("id");
      if (err) throw err;
      if (!deleted || deleted.length === 0) {
        throw new Error(
          "Delete failed — database is blocking writes. Run scripts/update-schema-4-rls.sql in Supabase SQL editor.",
        );
      }
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      setError(
        (err as Error)?.message ?? "Failed to delete product",
      );
    }
  };

  const toggleSection = async (product: Product, key: string) => {
    const current = product.home_sections ?? [];
    const next = current.includes(key)
      ? current.filter((k) => k !== key)
      : [...current, key];
    setProducts((prev) =>
      prev.map((p) => (p.id === product.id ? { ...p, home_sections: next } : p)),
    );
    setBusyId(product.id);
    try {
      const supabase = createClient();
      const { data: updated, error: err } = await supabase
        .from("products")
        .update({ home_sections: next })
        .eq("id", product.id)
        .select("id");
      if (err) throw err;
      if (!updated || updated.length === 0) {
        throw new Error(
          "Save failed — database is blocking writes. Run scripts/update-schema-4-rls.sql in Supabase SQL editor.",
        );
      }
    } catch (err) {
      setProducts((prev) =>
        prev.map((p) =>
          p.id === product.id ? { ...p, home_sections: current } : p,
        ),
      );
      setError(
        (err as Error)?.message ??
          "Toggle failed — make sure home_sections column exists (scripts/update-schema-3.sql)",
      );
    } finally {
      setBusyId(null);
    }
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return products.filter((p) => {
      const matchQ =
        !q ||
        p.name?.toLowerCase().includes(q) ||
        p.category?.toLowerCase().includes(q);
      const matchS =
        !sectionFilter || (p.home_sections ?? []).includes(sectionFilter);
      return matchQ && matchS;
    });
  }, [products, query, sectionFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageRows = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  useEffect(() => {
    setPage(1);
  }, [query, sectionFilter, products.length]);

  if (!authenticated) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
      {/* heading */}
      <div className="mb-7 flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Products
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Add, edit or delete — and control where each one shows on the site.
          </p>
        </div>
        <Button
          size="sm"
          onClick={() => setModal({ mode: "add", product: null })}
          className="shrink-0 gap-2 rounded-xl font-bold shadow-md shadow-primary/20"
        >
          <Plus className="w-4 h-4" />
          Add
        </Button>
      </div>

      {/* toolbar */}
      <div className="glass rounded-2xl p-3.5 mb-5 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <span className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products or categories…"
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border/70 bg-background/80 text-sm placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </span>
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground mr-1">
            Section:
          </span>
          {[
            { key: "hero", label: "Hero", Icon: Sparkles },
            { key: "trending", label: "Trending", Icon: Flame },
            { key: "fresh", label: "Fresh", Icon: Star },
          ].map(({ key, label, Icon }) => (
            <button
              key={key}
              type="button"
              onClick={() =>
                setSectionFilter((cur) => (cur === key ? null : key))
              }
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors ${
                sectionFilter === key
                  ? "bg-primary text-white border-primary"
                  : "bg-card text-muted-foreground border-border hover:border-primary/50 hover:text-primary"
              }`}
            >
              <Icon className="w-3 h-3" />
              {label}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3.5 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm">
          {error}
        </div>
      )}

      {/* loading */}
      {loading && (
        <div className="flex justify-center items-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      )}

      {/* list */}
      {!loading &&
        (filtered.length > 0 ? (
          <div className="space-y-3">
            <p className="text-xs text-muted-foreground px-1">
              Showing{" "}
              <span className="font-bold text-foreground">
                {(safePage - 1) * PAGE_SIZE + 1}–
                {Math.min(safePage * PAGE_SIZE, filtered.length)}
              </span>{" "}
              of <span className="font-bold text-foreground">{filtered.length}</span>{" "}
              products{(query || sectionFilter) && " (filtered)"}
            </p>
            {pageRows.map((product) => (
              <Card
                key={product.id}
                className="rounded-2xl overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="p-3.5 sm:p-4 flex flex-col xl:flex-row xl:items-center gap-3.5">
                  {/* identity */}
                  <div className="flex items-center gap-3.5 min-w-0 flex-1">
                    <div className="shrink-0 w-14 h-14 sm:w-16 sm:h-16 rounded-xl border border-border/60 bg-gradient-to-br from-white to-primary/[0.05] overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={product.image_url || "/placeholder.svg"}
                        alt=""
                        loading="lazy"
                        className="w-full h-full object-contain p-1.5"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <Link
                        href={`/products/${product.slug ?? product.id}`}
                        target="_blank"
                        className="group font-semibold text-sm sm:text-[15px] line-clamp-1 hover:text-primary transition-colors inline-flex items-center gap-1"
                      >
                        {product.name}
                        <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </Link>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs text-muted-foreground">
                        {product.category && (
                          <span className="px-2 py-0.5 bg-secondary rounded-full font-medium capitalize">
                            {product.category}
                          </span>
                        )}
                        <span className="font-bold text-primary">
                          ₹{product.price.toLocaleString("en-IN")}
                        </span>
                        {product.rating != null && (
                          <span className="inline-flex items-center gap-1 font-semibold text-amber-600">
                            <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                            {product.rating}
                          </span>
                        )}
                        {product.source && (
                          <span className="uppercase font-bold tracking-wide text-[10px]">
                            {product.source}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* toggles + actions */}
                  <div className="flex flex-col sm:flex-row xl:flex-col 2xl:flex-row items-stretch xl:items-center sm:items-center gap-2.5 shrink-0">
                    <div className="relative">
                      <SectionToggles
                        compact
                        value={product.home_sections ?? []}
                        onChange={(next) => {
                          const cur = product.home_sections ?? [];
                          const key =
                            next.length > cur.length
                              ? next.find((k) => !cur.includes(k))
                              : cur.find((k) => !next.includes(k));
                          if (key) toggleSection(product, key);
                        }}
                        disabled={busyId === product.id}
                      />
                      {busyId === product.id && (
                        <span className="absolute -top-1.5 -right-1.5">
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setModal({ mode: "edit", product })}
                        className="gap-1.5 bg-transparent rounded-xl"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(product.id)}
                        className="gap-1.5 bg-transparent rounded-xl text-destructive border-destructive/30 hover:bg-destructive/10 hover:text-destructive"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}

            {/* pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 pt-4 pb-2 flex-wrap">
                <button
                  type="button"
                  disabled={safePage === 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="inline-flex items-center gap-1 px-3.5 py-2 rounded-xl text-sm font-semibold border border-border bg-card disabled:opacity-40 disabled:cursor-not-allowed hover:border-primary/40 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Prev
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(
                    (n) =>
                      n === 1 ||
                      n === totalPages ||
                      Math.abs(n - safePage) <= 1,
                  )
                  .map((n, idx, arr) => (
                    <Fragment key={n}>
                      {idx > 0 && n - arr[idx - 1] > 1 && (
                        <span className="text-muted-foreground px-1">…</span>
                      )}
                      <button
                        type="button"
                        onClick={() => setPage(n)}
                        className={`w-9 h-9 rounded-xl text-sm font-bold border transition-colors ${
                          n === safePage
                            ? "bg-primary text-white border-primary"
                            : "bg-card border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"
                        }`}
                      >
                        {n}
                      </button>
                    </Fragment>
                  ))}
                <button
                  type="button"
                  disabled={safePage === totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className="inline-flex items-center gap-1 px-3.5 py-2 rounded-xl text-sm font-semibold border border-border bg-card disabled:opacity-40 disabled:cursor-not-allowed hover:border-primary/40 transition-colors"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        ) : (
          <Card className="rounded-2xl">
            <div className="py-16 text-center">
              <span className="inline-flex w-14 h-14 rounded-2xl bg-primary/10 text-primary items-center justify-center mb-4">
                <PackageOpen className="w-6 h-6" />
              </span>
              <p className="font-bold text-lg mb-1">
                {query || sectionFilter ? "No matches" : "No products yet"}
              </p>
              <p className="text-sm text-muted-foreground mb-5">
                {query || sectionFilter
                  ? "Try a different search or clear the section filter."
                  : "Add your first product to get started."}
              </p>
              {!query && !sectionFilter && (
                <Button
                  onClick={() => setModal({ mode: "add", product: null })}
                  className="gap-2 rounded-xl font-bold shadow-md shadow-primary/20"
                >
                  <Plus className="w-4 h-4" /> Add Product
                </Button>
              )}
            </div>
          </Card>
        ))}

      {/* add / edit modal */}
      {modal && (
        <ProductFormModal
          mode={modal.mode}
          product={modal.product}
          categories={categories}
          onClose={() => setModal(null)}
          onSaved={() => {
            setModal(null);
            fetchData();
          }}
        />
      )}
    </div>
  );
}
