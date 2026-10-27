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

function DealCard({ product, delay = 0 }: { product: DealProduct; delay?: number }) {
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
        <div className="relative w-full h-52 bg-gradient-to-br from-white via-white to-primary/[0.07] overflow-hidden">
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
            className="w-full h-full object-contain p-5 group-hover:scale-110 transition-transform duration-500"
          />
          {product.discount_percent != null && product.discount_percent > 0 && (
            <span className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-emerald-600 text-white text-[11px] font-bold shadow-md shadow-emerald-600/25">
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

        <div className="p-4 sm:p-5">
          <h3 className="text-[15px] font-semibold line-clamp-2 leading-snug group-hover:text-primary transition-colors">
            {product.name}
          </h3>

          <div className="flex items-baseline gap-2 mt-2 mb-3 flex-wrap">
            <span className="text-lg font-bold text-primary">
              ₹{product.price.toLocaleString("en-IN")}
            </span>
            {product.mrp != null && product.mrp > product.price && (
              <>
                <span className="text-xs text-muted-foreground line-through">
                  ₹{product.mrp.toLocaleString("en-IN")}
                </span>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-1.5 py-0.5 rounded-md uppercase tracking-wide">
                  Save ₹{(product.mrp - product.price).toLocaleString("en-IN")}
                </span>
              </>
            )}
            {product.review_count != null && (
              <span className="ml-auto text-[11px] text-muted-foreground hidden sm:block">
                {product.review_count.toLocaleString("en-IN")} ratings
              </span>
            )}
          </div>

          <div className="flex items-center justify-between gap-2 pt-3 border-t border-border/50">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-foreground/70">
              <BadgeCheck className="w-3.5 h-3.5 text-emerald-600" />
              Verified deal
            </span>
            <span className="inline-flex items-center gap-1 text-xs font-bold text-primary group-hover:gap-2 transition-all">
              View Deal
              <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>
      </Link>
    </Reveal>
  );
}

export default DealCard;
