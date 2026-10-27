import Link from "next/link";
import {
  Compass,
  Home,
  ShoppingBag,
  PackageOpen,
  SearchX,
  ArrowRight,
} from "lucide-react";
import { Reveal } from "@/components/page-parts";

const CATEGORY_LINKS = [
  { label: "Electronics", href: "/products?category=electronics" },
  { label: "Fashion", href: "/products?category=fashion" },
  { label: "Home", href: "/products?category=home" },
  { label: "Kitchen", href: "/products?category=kitchen" },
];

export default function NotFound() {
  return (
    <div className="relative min-h-[85vh] pt-32 pb-24 overflow-hidden">
      {/* ---- decorations ---- */}
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-16 mx-auto w-[42rem] max-w-full h-72 rounded-full bg-primary/[0.08] blur-3xl pointer-events-none animate-glow-pulse"
      />
      <PackageOpen
        aria-hidden="true"
        className="absolute left-[6%] top-40 w-14 h-14 text-primary/10 hidden md:block animate-float"
        style={{ animationDelay: "-2s" } as React.CSSProperties}
      />
      <SearchX
        aria-hidden="true"
        className="absolute right-[7%] top-52 w-12 h-12 text-primary/10 hidden md:block animate-float"
        style={{ animationDelay: "-4s" } as React.CSSProperties}
      />

      <main className="relative max-w-4xl mx-auto px-4 sm:px-6 text-center">
        {/* ---- 404 artwork ---- */}
        <Reveal>
          <div
            role="img"
            aria-label="404 — page not found"
            className="inline-flex items-center justify-center gap-2 select-none"
          >
            {/* floating product card, tipped left */}
            <span className="hidden sm:inline-flex w-16 h-20 rounded-2xl glass rotate-[-10deg] translate-y-3 bg-gradient-to-br from-white to-primary/[0.06] items-center justify-center animate-float">
              <ShoppingBag className="w-6 h-6 text-primary/50" />
            </span>

            <span className="relative text-[7rem] sm:text-[10rem] leading-[0.85] font-black tracking-tighter">
              <span className="bg-gradient-to-b from-primary via-violet-400 to-primary bg-clip-text text-transparent drop-shadow-sm">
                404
              </span>
            </span>

            <span className="hidden sm:inline-flex w-16 h-20 rounded-2xl glass rotate-[10deg] translate-y-3 bg-gradient-to-br from-white to-primary/[0.06] items-center justify-center animate-float">
              <Compass className="w-6 h-6 text-primary/50" />
            </span>
          </div>
        </Reveal>

        {/* ---- copy ---- */}
        <Reveal delay={120}>
          <h1 className="mt-6 text-2xl sm:text-3xl font-extrabold tracking-tight">
            This page wandered off the shelf.
          </h1>
          <p className="mt-3 text-muted-foreground text-sm sm:text-base leading-relaxed max-w-xl mx-auto text-balance">
            The link you followed doesn&apos;t exist — maybe the product was moved,
            renamed or is no longer featured. The good stuff is still one hop away.
          </p>
        </Reveal>

        {/* ---- actions ---- */}
        <Reveal delay={220}>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-xl font-bold text-sm transition-colors"
            >
              <Home className="w-4 h-4" />
              Back to Home
            </Link>
            <Link
              href="/products"
              className="group inline-flex items-center gap-2 rounded-xl border border-border bg-card px-6 py-3 font-bold text-sm text-foreground hover:border-primary/40 hover:text-primary transition-colors"
            >
              <ShoppingBag className="w-4 h-4" />
              Browse Products
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        </Reveal>

        {/* ---- quick jump category chips ---- */}
        <Reveal delay={320}>
          <div className="mt-10">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground mb-3">
              Or jump straight to a category
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2">
              {CATEGORY_LINKS.map((c) => (
                <Link
                  key={c.href}
                  href={c.href}
                  className="rounded-full border border-border bg-card px-4 py-2 text-xs font-semibold text-muted-foreground hover:border-primary/40 hover:text-primary transition-colors"
                >
                  {c.label}
                </Link>
              ))}
            </div>
          </div>
        </Reveal>
      </main>
    </div>
  );
}
