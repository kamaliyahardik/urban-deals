"use client";

import React, { Suspense } from "react";import Link from "next/link";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Star, ExternalLink, Loader2 } from "lucide-react";

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
  rating?: number | null;
  review_count?: number | null;
  source?: string | null;
}

interface Category {
  id: number;
  name: string;
  slug: string;
}

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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>(
    searchParams.get("category") || "all",
  );
  const [categories, setCategories] = useState<string[]>(["all"]);

  useEffect(() => {
    async function fetchData() {
      try {
        const supabase = createClient();
        
        // Fetch categories
        const { data: catData, error: catError } = await supabase
          .from("categories")
          .select("slug")
          .order("name", { ascending: true });
        
        if (!catError && catData) {
            setCategories(["all", ...catData.map(c => c.slug)]);
        } else {
            // Fallback if categories table is empty or error
            setCategories(["all", "electronics", "home", "sports", "kitchen"]);
        }

        // Fetch products
        let query = supabase.from("products").select("*");

        if (selectedCategory !== "all") {
          query = query.eq("category", selectedCategory);
        }

        const { data, error: err } = await query.order("created_at", {
          ascending: false,
        });

        if (err) throw err;
        setProducts(data || []);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load products",
        );
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [selectedCategory]);

  return (
    <div className="min-h-screen bg-background pt-24 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary mb-6"
          >
            <span>←</span> Back to Home
          </Link>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Our Products</h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Browse our carefully curated collection of premium products from
            Amazon.
          </p>
        </div>

        {/* Category Filter */}
        <div className="mb-8 flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-full font-medium transition-all ${
                selectedCategory === cat
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              }`}
            >
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 text-destructive">
            {error}
          </div>
        )}

        {/* Products Grid */}
        {!loading && !error && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.length > 0 ? (
              products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <p className="text-muted-foreground text-lg">
                  No products found in this category.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function Stars({ value, size = 14 }: { value: number; size?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          style={{ width: size, height: size }}
          className={
            i <= Math.round(value)
              ? "text-yellow-400 fill-yellow-400"
              : "text-muted-foreground/25 fill-transparent"
          }
        />
      ))}
    </div>
  );
}

function ProductCard({ product }: { product: Product }) {
  return (
    <Card className="overflow-hidden hover:shadow-xl hover:border-primary/30 hover:-translate-y-1 transition-all duration-300 rounded-2xl">
      {/* Image */}
      <Link href={`/products/${product.slug || product.id}`} className="block">
        <div className="relative w-full h-64 sm:h-72 bg-gradient-to-br from-white to-primary/[0.05] overflow-hidden">
          <img
            src={product.image_url || "/placeholder.svg"}
            alt={product.name}
            className="w-full h-full object-contain p-6 sm:p-8 hover:scale-110 transition-transform duration-500"
          />
          {product.discount_percent != null && product.discount_percent > 0 && (
            <span className="absolute top-4 left-4 px-3 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-bold shadow-lg shadow-emerald-600/25">
              {product.discount_percent}% OFF
            </span>
          )}
          {product.rating != null && (
            <span className="absolute bottom-3 right-3 inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/90 backdrop-blur text-xs font-bold text-amber-600 shadow-sm">
              <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
              {product.rating}
            </span>
          )}
        </div>
      </Link>

      {/* Content */}
      <div className="p-5 sm:p-6">
        <Link href={`/products/${product.slug || product.id}`}>
          <h3 className="text-lg sm:text-xl font-semibold mb-2 line-clamp-2 hover:text-primary transition-colors leading-snug">
            {product.name}
          </h3>
        </Link>

        {/* Price */}
        <div className="flex items-baseline gap-2 mb-4">
          <span className="text-2xl font-bold text-primary">
            ₹{product.price.toLocaleString("en-IN")}
          </span>
          {product.mrp != null && product.mrp > product.price && (
            <span className="text-sm text-muted-foreground line-through">
              ₹{product.mrp.toLocaleString("en-IN")}
            </span>
          )}
        </div>

        {/* Category + buy info */}
        <div className="flex items-center justify-between mb-4">
          {product.category ? (
            <span className="inline-block px-3 py-1 bg-secondary text-secondary-foreground text-xs font-medium rounded-full capitalize">
              {product.category}
            </span>
          ) : (
            <span />
          )}
          {(product.rating != null || product.review_count != null) && (
            <span className="text-xs text-muted-foreground flex items-center gap-1.5">
              {product.rating != null && <Stars value={product.rating} size={12} />}
              {product.review_count != null &&
                `${product.review_count.toLocaleString("en-IN")} ratings`}
            </span>
          )}
        </div>

        {/* CTA */}
        <div className="flex gap-2.5 pt-4 border-t border-border/60">
          <Link href={`/products/${product.slug || product.id}`} className="flex-1">
            <Button className="w-full h-11 rounded-xl font-bold bg-primary hover:bg-primary/90">
              View Details
            </Button>
          </Link>
          {product.affiliate_link && (
            <a
              href={product.affiliate_link}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Buy ${product.name} now`}
            >
              <Button className="h-11 gap-2 px-4 rounded-xl font-bold shadow-md shadow-primary/20">
                Buy Now
                <ExternalLink className="w-4 h-4" />
              </Button>
            </a>
          )}
        </div>
      </div>
    </Card>
  );
}
