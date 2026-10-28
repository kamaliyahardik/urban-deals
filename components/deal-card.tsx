"use client";

import React from "react";
import Link from "next/link";
import { Star, BadgeCheck, ArrowRight } from "lucide-react";
import { Reveal } from "@/components/page-parts";

export interface DealProduct {
  name: string;
  slug: string;
  image_url: string | null;
  price: number;
  mrp?: number | null;
  discount_percent?: number | null;
  rating?: number | null;
  review_count?: number | null;
  source?: string | null;
}

function DealCard({
  product,
  delay = 0,
  compact = false,
}: {
  product: DealProduct;
  delay?: number;
  /** medium size for listing grids (home/sections use the full card) */
  compact?: boolean;
}) {
  const save =
    product.mrp != null && product.mrp > product.price
      ? Math.round(product.mrp - product.price)
      : 0;
  return (
    <Reveal delay={delay}>
      <Link
        href={`/products/${product.slug}`}
        className="group block rounded-2xl border border-border/60 bg-card overflow-hidden hover:shadow-xl hover:border-primary/40 hover:-translate-y-1.5 transition-all duration-300"
      >
        <div
          className={`relative w-full bg-gradient-to-br from-white via-white to-primary/[0.07] overflow-hidden ${
            compact ? "h-36 sm:h-40" : "h-52"
          }`}
        >
          {/* soft violet glow behind product on hover */}
          <span
            aria-hidden="true"
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            style={{
              background:
                "radial-gradient(60% 60% at 50% 45%, oklch(0.541 0.247 293 / 0.07), transparent 70%)",
            }}
          />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={product.image_url || "/placeholder.svg"}
            alt={product.name}
            loading="lazy"
            className={`w-full h-full object-contain group-hover:scale-110 transition-transform duration-500 ${
              compact ? "p-3.5" : "p-5"
            }`}
          />
          {product.discount_percent != null && product.discount_percent > 0 && (
            <span
              className={`absolute top-3 left-3 rounded-lg bg-emerald-600 text-white font-bold shadow-md shadow-emerald-600/25 ${
                compact ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-[11px]"
              }`}
            >
              {product.discount_percent}% OFF
            </span>
          )}
          {product.rating != null && (
            <span className="absolute bottom-3 right-3 inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-white/90 backdrop-blur text-[11px] font-bold text-amber-600 shadow-sm">
              <Star className="w-2.5 h-2.5 fill-amber-500 text-amber-500" />
              {product.rating}
            </span>
          )}
          {product.source && (
            <span className="absolute top-3 right-3 px-2 py-1 rounded-lg bg-white/90 backdrop-blur text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground shadow-sm">
              {product.source}
            </span>
          )}
        </div>

        <div className={compact ? "p-3" : "p-4 sm:p-5"}>
          <h3
            className={`font-semibold line-clamp-2 leading-snug group-hover:text-primary transition-colors ${
              compact ? "text-[13px] sm:text-sm" : "text-[15px]"
            }`}
          >
            {product.name}
          </h3>

          <div className="flex items-baseline gap-2 mt-2 mb-3 flex-wrap">
            <span
              className={`font-bold text-primary ${compact ? "text-base" : "text-lg"}`}
            >
              ₹{product.price.toLocaleString("en-IN")}
            </span>
            {product.mrp != null && product.mrp > product.price && (
              <>
                <span className="text-xs text-muted-foreground line-through">
                  ₹{product.mrp.toLocaleString("en-IN")}
                </span>
                <span
                  className={`font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-md uppercase tracking-wide ${
                    compact
                      ? "text-[9px] px-1 py-0.5"
                      : "text-[10px] px-1.5 py-0.5"
                  }`}
                >
                  Save ₹{(product.mrp - product.price).toLocaleString("en-IN")}
                </span>
              </>
            )}
            {product.review_count != null && !compact && (
              <span className="ml-auto text-[11px] text-muted-foreground hidden sm:block">
                {product.review_count.toLocaleString("en-IN")} ratings
              </span>
            )}
          </div>

          <div className="flex items-center justify-between gap-2 border-t border-border/50">
            <span
              className={`inline-flex items-center gap-1.5 font-semibold text-foreground/70 ${
                compact ? "pt-2 text-[10px]" : "pt-3 text-xs"
              }`}
            >
              <BadgeCheck className={compact ? "w-3 h-3 text-emerald-600" : "w-3.5 h-3.5 text-emerald-600"} />
              Verified
            </span>
            <span
              className={`inline-flex items-center gap-1 font-bold text-primary group-hover:gap-1.5 transition-all ${
                compact ? "pt-2 text-[10px] sm:text-[11px]" : "pt-3 text-xs"
              }`}
            >
              Buy Now
              <ArrowRight className={compact ? "w-3 h-3" : "w-3.5 h-3.5"} />
            </span>
          </div>
        </div>
      </Link>
    </Reveal>
  );
}

export default DealCard;
