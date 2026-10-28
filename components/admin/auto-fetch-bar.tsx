"use client";

import React, { useState } from "react";
import { Loader2, Sparkles, X, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { ProductDraft } from "@/lib/product-fetcher";
import { getAdminToken } from "@/lib/admin-auth";

interface Props {
  /** Called when admin clicks "Use These Details"; receives fetched draft + final URL */
  onFilled: (draft: ProductDraft) => void;
}

export function AutoFetchBar({ onFilled }: Props) {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [draft, setDraft] = useState<ProductDraft | null>(null);

  const handleFetch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;
    setError("");
    setDraft(null);
    setLoading(true);
    try {
      const token = getAdminToken();
      const res = await fetch("/api/admin/fetch-product", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify({ url: url.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.message ?? "Fetch failed. Please fill details manually.");
      }
      setDraft(data.draft as ProductDraft);
    } catch (err) {
      setError(
        (err as Error)?.message ??
          "Fetch failed. Please fill the details manually or retry.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleApply = () => {
    if (!draft) return;
    onFilled(draft);
    setDraft(null);
    setUrl("");
  };

  const supported = /amazon\.|flipkart\.|myntra\.|fkrt\.art/i.test(url);

  return (
    <Card className="p-5 border-2 border-primary/40 bg-primary/5">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="w-5 h-5 text-primary" />
        <h2 className="text-lg font-semibold">
          Quick Add — Auto-Fill from Product Link
        </h2>
      </div>
      <p className="text-sm text-muted-foreground mb-4">
        Paste the product URL from <strong>Amazon</strong>,{" "}
        <strong>Flipkart</strong> or <strong>Myntra</strong>. We&apos;ll
        auto-fetch the name, price, images and key features — you just review
        and upload.
      </p>

      <form onSubmit={handleFetch} className="flex flex-col sm:flex-row gap-3">
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="flex-1 px-4 py-2 rounded-lg border border-border bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          placeholder="https://www.amazon.in/Apple-iPhone-6s-Space-Grey/dp/B016QBTJWQ"
        />
        <Button type="submit" disabled={loading || !url.trim()}>
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin mr-2" /> Fetching…
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" /> Fetch Details
            </>
          )}
        </Button>
      </form>

      {url && !supported && !loading && (
        <p className="mt-2 text-xs text-amber-600 flex items-center gap-1">
          <AlertCircle className="w-3.5 h-3.5" />
          Currently supported: Amazon, Flipkart and Myntra links.
        </p>
      )}

      {error && (
        <div className="mt-3 p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-sm text-destructive flex items-start gap-2">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {draft && (
        <div className="mt-4 p-4 bg-background border border-border rounded-lg">
          <div className="flex justify-between items-start mb-3">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              Details fetched from{" "}
              <span className="uppercase text-primary">{draft.source}</span>
            </div>
            <button
              type="button"
              onClick={() => setDraft(null)}
              className="text-muted-foreground hover:text-foreground"
              aria-label="Close preview"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            {draft.image_url && (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={draft.image_url}
                alt={draft.name || "product"}
                className="w-24 h-24 object-contain rounded-lg border border-border bg-white shrink-0"
              />
            )}
            <div className="flex-1 min-w-0 text-sm space-y-1">
              <p className="font-medium truncate">{draft.name || "—"}</p>
              <p className="text-muted-foreground">
                {draft.price != null ? `₹ ${draft.price.toLocaleString("en-IN")}` : "Price not found"}
                {draft.mrp != null && draft.price != null && draft.mrp > draft.price && (
                  <span className="line-through ml-2 text-xs">
                    ₹ {draft.mrp.toLocaleString("en-IN")}
                  </span>
                )}
                {draft.discount_percent != null && draft.discount_percent > 0 && (
                  <span className="ml-2 text-xs font-semibold text-green-600">
                    {draft.discount_percent}% off
                  </span>
                )}
                {draft.brand && <span className="ml-2 text-xs">· {draft.brand}</span>}
                {draft.rating != null && <span className="ml-2 text-xs">· ⭐ {draft.rating}</span>}
                {draft.review_count != null && (
                  <span className="text-xs"> ({draft.review_count.toLocaleString("en-IN")} ratings)</span>
                )}
                {draft.availability && (
                  <span className={`ml-2 text-xs ${draft.availability === "Out of Stock" ? "text-destructive" : "text-green-600"}`}>
                    · {draft.availability}
                  </span>
                )}
              </p>
              <p className="text-xs text-muted-foreground">
                {draft.images.length > 0 && <span>🖼 {draft.images.length} images</span>}
                {draft.features.length > 0 && <span> · ✨ {draft.features.length} features</span>}
                {draft.specs.length > 0 && <span> · 📋 {draft.specs.length} specs</span>}
                {draft.reviews.length > 0 && <span> · 💬 {draft.reviews.length} reviews</span>}
              </p>
              {draft.category && (
                <p className="text-xs text-muted-foreground">
                  🗂 Category:{" "}
                  <span className="font-semibold text-primary capitalize">
                    {draft.category}
                  </span>{" "}
                  <span className="text-[11px]">(auto-selected)</span>
                </p>
              )}
              {draft.image_url && (
                <p className="text-xs text-muted-foreground truncate">
                  Image: {draft.images.length > 1 ? `${draft.images.length} images (first used)` : "1 image"}
                </p>
              )}
            </div>
          </div>

          <div className="flex gap-3 mt-4">
            <Button type="button" onClick={handleApply}>
              <CheckCircle2 className="w-4 h-4 mr-2" /> Use These Details
            </Button>
            <Button type="button" variant="outline" onClick={() => setDraft(null)}>
              Discard
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}
