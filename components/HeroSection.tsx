"use client";

import React from "react";
import Link from "next/link";
import { Star, Zap, ArrowRight, TrendingUp } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface HeroProduct {
  id: number;
  name: string;
  slug: string;
  image_url: string | null;
  price: number;
  rating: number | null;
  home_sections?: string[] | null;
}

/* ---------------------------- Count-up stat --------------------------- */

function CountUp({ to, suffix }: { to: number; suffix?: string }) {
  const [val, setVal] = React.useState(0);
  const started = React.useRef(false);
  const ref = React.useRef<HTMLSpanElement>(null);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const t0 = performance.now();
          const duration = 1400;
          const tick = (t: number) => {
            const p = Math.min(1, (t - t0) / duration);
            const eased = 1 - Math.pow(1 - p, 3);
            setVal(Math.round(to * eased));
            if (p < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        }
      },
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [to]);

  return (
    <span ref={ref} className="tabular-nums">
      {val.toLocaleString("en-IN")}
      {suffix}
    </span>
  );
}

/* ------------------------- Floating product card ---------------------- */

function FloatChip({
  product,
  className = "",
  duration = "6s",
  delay = "0s",
  rotateClass = "",
  index,
}: {
  product: HeroProduct;
  className?: string;
  duration?: string;
  delay?: string;
  rotateClass?: string;
  index: number;
}) {
  return (
    <Link
      href={`/products/${product.slug}`}
      style={{
        animationDuration: duration,
        animationDelay: delay,
        animationFillMode: "both",
      }}
      className={`group animate-float absolute z-10 pointer-events-auto w-44 sm:w-48 glass rounded-2xl p-2.5 shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 ${rotateClass} ${className}`}
    >
      <div className="aspect-square rounded-xl overflow-hidden bg-gradient-to-br from-white to-primary/[0.05]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={product.image_url || "/placeholder.svg"}
          alt={product.name}
          loading="lazy"
          className="w-full h-full object-contain p-2.5 group-hover:scale-110 transition-transform duration-300 img-fade-in"
        />
      </div>
      <p className="text-[11px] font-semibold leading-tight mt-2 truncate">{product.name}</p>
      <div className="flex items-center justify-between mt-1">
        <span className="text-sm font-bold text-primary">
          ₹{product.price.toLocaleString("en-IN")}
        </span>
        {product.rating != null && (
          <span className="text-[10px] font-bold text-amber-600 flex items-center gap-0.5">
            <Star className="w-2.5 h-2.5 fill-amber-500 text-amber-500" />
            {product.rating}
          </span>
        )}
      </div>
    </Link>
  );
}

/* -------------------------------- Hero -------------------------------- */

const HEADLINE_1 = ["Discover", "products", "that"];

const STATS = [
  { value: 100, suffix: "%", label: "Honest, no-fluff reviews" },
  { value: 12000, suffix: "+", label: "Products compared & rated" },
  { value: 5000, suffix: "+", label: "Smart readers every month" },
  { value: 27, suffix: "+", label: "Top brands curated daily" },
];

const FALLBACK_TICKER = [
  "Electronics",
  "Fashion",
  "Watches",
  "Beauty",
  "Home Essentials",
  "Fitness",
  "Accessories",
  "Kitchen",
  "Travel Gear",
  "Audio",
];

const HeroSection = () => {
  const [top, setTop] = React.useState<HeroProduct[]>([]);

  // Pull highest-rated real products for the floating chips + ticker
  React.useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const supabase = createClient();
        const { data } = await supabase
          .from("products")
          .select("id, name, slug, image_url, price, rating, home_sections")
          .neq("price", 0)
          .limit(30);
        if (!alive) return;
        const list = (data ?? []) as HeroProduct[];
        // Strict: hero chips ONLY for products toggled into the hero section
        const tagged = list.filter((p) =>
          (p.home_sections ?? []).includes("hero"),
        );
        setTop(tagged.slice(0, 6));
      } catch {
        /* hero should never break — die silently */
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const floats = top.slice(0, 3);
  const tickerItems = top.length
    ? top.map((p) => ({ key: p.id, text: p.name, price: `₹${p.price.toLocaleString("en-IN")}`, slug: p.slug }))
    : FALLBACK_TICKER.map((text, i) => ({ key: `f${i}`, text, price: "", slug: "/products" }));

  const anim = (i: number) => ({
    animationDelay: `${i * 70}ms`,
    animationFillMode: "both" as const,
  });

  // Gentle mouse parallax for the floating product chips (desktop only)
  const floatRef = React.useRef<HTMLDivElement>(null);
  const onHeroMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    const el = floatRef.current;
    if (!el) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    el.style.transform = `translate3d(${(x * 18).toFixed(1)}px, ${(y * 14).toFixed(1)}px, 0) rotate(${(x * 0.6).toFixed(2)}deg)`;
  };
  const onHeroMouseLeave = () => {
    const el = floatRef.current;
    if (el) el.style.transform = "translate3d(0, 0, 0) rotate(0deg)";
  };

  return (
    <section
      className="relative isolate flex flex-col items-center overflow-hidden px-4 pt-36 pb-10"
      aria-label="Hero"
      onMouseMove={onHeroMouseMove}
      onMouseLeave={onHeroMouseLeave}
    >
      {/* Center glow */}
      <div
        aria-hidden
        className="animate-glow-pulse absolute left-1/2 top-0 -z-10 h-[36rem] w-[36rem] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl"
      />

      {/* Badge */}
      <div
        className="animate-in fade-in slide-in-from-bottom-3 duration-500 flex flex-wrap items-center justify-center gap-2 pl-2 pr-4 py-1.5 rounded-full glass"
      >
        <span className="relative flex size-3.5 items-center justify-center">
          <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping duration-300" />
          <span className="relative inline-flex size-2 rounded-full bg-emerald-600" />
        </span>
        <p className="text-xs sm:text-sm text-muted-foreground font-medium">
          Trusted by 100+ smart shoppers worldwide
        </p>
      </div>

      {/* Headline */}
      <h1 className="mt-7 max-w-3xl text-center text-4xl sm:text-5xl md:text-[64px] leading-[1.08] font-extrabold tracking-tight">
        {HEADLINE_1.map((w, i) => (
          <span
            key={i}
            style={anim(i)}
            className="animate-in fade-in slide-in-from-bottom-5 duration-700 inline-block mr-2 sm:mr-3"
          >
            {w}
          </span>
        ))}
        <span
          style={anim(3)}
          className="animate-in fade-in slide-in-from-bottom-5 duration-700 inline-block mr-2 sm:mr-3 bg-gradient-to-r from-violet-600 via-fuchsia-500 to-violet-600 bg-clip-text text-transparent text-shine"
        >
          truly
        </span>
        <span
          style={anim(4)}
          className="animate-in fade-in slide-in-from-bottom-5 duration-700 inline-block bg-gradient-to-r from-violet-600 via-fuchsia-500 to-violet-600 bg-clip-text text-transparent text-shine"
        >
          deliver.
        </span>
      </h1>

      {/* Sub copy */}
      <p
        style={anim(5)}
        className="animate-in fade-in slide-in-from-bottom-5 duration-700 max-w-[620px] mt-5 text-center text-sm sm:text-base text-muted-foreground leading-relaxed"
      >
        Top-rated picks, honest reviews and real discounts — every product
        hand-verified so you can buy with total confidence.
      </p>

      {/* CTA */}
      <div
        style={anim(6)}
        className="animate-in fade-in slide-in-from-bottom-5 duration-700 mt-8 flex flex-wrap items-center justify-center gap-4"
      >
        <Link
          href="/products"
          className="group inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-7 py-3.5 rounded-xl font-bold shadow-lg shadow-primary/25 transition-all active:scale-95"
        >
          <Zap className="w-4 h-4 fill-white" />
          Explore Products
          <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
        </Link>
        <a
          href="#trending"
          className="group inline-flex items-center gap-1.5 text-sm font-semibold text-foreground/70 hover:text-primary transition-colors px-2 py-2"
        >
          <TrendingUp className="w-4 h-4" />
          See what&apos;s hot
          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
        </a>
      </div>

      {/* Floating product chips — desktop, around the headline */}
      {floats.length > 0 && (
        <div
          ref={floatRef}
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none hidden lg:block transition-transform duration-500 ease-out will-change-transform"
        >
          <FloatChip
            product={floats[0]}
            className="left-0 top-40"
            rotateClass="-rotate-6"
            duration="6s"
            delay="600ms"
            index={0}
          />
          {floats[1] && (
            <FloatChip
              product={floats[1]}
              className="right-0 top-24"
              rotateClass="rotate-[5deg]"
              duration="7s"
              delay="900ms"
              index={1}
            />
          )}
          {floats[2] && (
            <FloatChip
              product={floats[2]}
              className="right-6 xl:right-14 bottom-24"
              rotateClass="-rotate-3"
              duration="8s"
              delay="1200ms"
              index={2}
            />
          )}
        </div>
      )}

      {/* Mobile product strip */}
      {floats.length > 0 && (
        <div className="lg:hidden w-full max-w-sm mt-10 grid grid-cols-3 gap-2.5 animate-in fade-in slide-in-from-bottom-5 duration-700 [animation-fill-mode:both]">
          {floats.map((p) => (
            <Link
              key={p.id}
              href={`/products/${p.slug}`}
              className="group glass rounded-2xl p-2"
            >
              <div className="aspect-square rounded-xl overflow-hidden bg-gradient-to-br from-white to-primary/[0.05]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={p.image_url || "/placeholder.svg"}
                  alt={p.name}
                  loading="lazy"
                  className="w-full h-full object-contain p-1.5 group-hover:scale-110 transition-transform duration-300 img-fade-in"
                />
              </div>
              <span className="block text-xs font-bold text-primary mt-1.5">
                ₹{p.price.toLocaleString("en-IN")}
              </span>
            </Link>
          ))}
        </div>
      )}

      {/* Divider */}
      <div className="w-full max-w-[800px] h-[3px] mt-12 rounded-full bg-linear-to-r from-background via-primary to-background opacity-70" />

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-8 py-12 max-w-[930px] w-full">
        {STATS.map((s, i) => (
          <div
            key={i}
            style={anim(i)}
            className="animate-in fade-in slide-in-from-bottom-5 duration-700 text-center group"
          >
            <h2 className="font-extrabold text-3xl md:text-4xl text-foreground tracking-tight group-hover:text-primary transition-colors duration-300">
              <CountUp to={s.value} suffix={s.suffix} />
            </h2>
            <p className="text-xs md:text-sm text-muted-foreground mt-1.5 max-w-[180px] mx-auto leading-snug">
              {s.label}
            </p>
          </div>
        ))}
      </div>

      {/* Trending ticker */}
      <div
        id="trending"
        className="marquee-paused relative w-full max-w-3xl mt-2 overflow-hidden py-2 opacity-90"
        style={{
          maskImage:
            "linear-gradient(90deg, transparent, black 12%, black 88%, transparent)",
          WebkitMaskImage:
            "linear-gradient(90deg, transparent, black 12%, black 88%, transparent)",
        }}
        aria-hidden={false}
      >
        <div className="animate-marquee w-max flex gap-3">
          {[...tickerItems, ...tickerItems].map((item, i) => (
            <Link
              key={`${item.key}-${i}`}
              href={item.slug}
              tabIndex={i >= tickerItems.length ? -1 : 0}
              className="shrink-0 inline-flex items-center gap-2 px-3.5 py-2 rounded-full glass text-xs font-medium text-foreground/80 hover:text-primary transition-colors whitespace-nowrap"
            >
              <Star className="w-3 h-3 fill-amber-400 text-amber-400 shrink-0" />
              <span className="max-w-[180px] truncate">{item.text}</span>
              {item.price && (
                <span className="font-bold text-primary">{item.price}</span>
              )}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
