"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Github,
  Instagram,
  Twitter,
  Youtube,
  ArrowUp,
  BadgeCheck,
  ChevronRight,
} from "lucide-react";
import { BrandMark } from "@/components/Logo";

const linkGroups = [
  {
    title: "Shop",
    links: [
      { label: "All Products", href: "/products" },
      { label: "Electronics", href: "/category/electronics" },
      { label: "Fashion", href: "/category/fashion" },
      { label: "Home", href: "/category/home" },
      { label: "Kitchen", href: "/category/kitchen" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About Us", href: "/about" },
      { label: "Contact", href: "/contact" },
      { label: "Add a Product", href: "/admin/login" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Disclaimer", href: "/disclaimer" },
      { label: "Terms of Use", href: "/terms" },
    ],
  },
];

const socials = [
  { label: "X / Twitter", href: "#", icon: <Twitter className="w-4 h-4" /> },
  { label: "Instagram", href: "#", icon: <Instagram className="w-4 h-4" /> },
  { label: "YouTube", href: "#", icon: <Youtube className="w-4 h-4" /> },
  { label: "GitHub", href: "#", icon: <Github className="w-4 h-4" /> },
];

export default function Footer() {
  const pathname = usePathname();

  // No footer inside the admin panel
  if (pathname?.startsWith("/admin")) return null;

  return (
    <footer className="relative bg-background">
      {/* clean, solid slab — no colour bleeding from behind */}
      <div className="border-t border-border/70 bg-card">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* top row — brand + link columns */}
          <div className="py-12 sm:py-16 grid gap-10 md:grid-cols-[1.5fr_1fr_1fr_1fr]">
            {/* brand */}
            <div className="max-w-sm">
              <Link href="/" className="inline-flex items-center gap-2.5 mb-5">
                <BrandMark className="w-9 h-9 text-primary" />
                <span className="flex flex-col leading-none">
                  <span className="flex items-start">
                    <span className="font-extrabold tracking-[0.08em] text-base">
                      URBAN
                    </span>
                    <span className="text-[8px] font-bold text-primary ml-0.5 mt-0.5">®</span>
                  </span>
                  <span className="font-light tracking-[0.32em] text-[11px] text-primary mt-0.5">
                    DEALS
                  </span>
                </span>
              </Link>
              <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                Hand-picked deals from Amazon, Flipkart &amp; Myntra — honest
                specs, real reviews, smart prices. Nothing else on the shelf
                makes the cut.
              </p>

              {/* trust chips */}
              <div className="flex flex-wrap gap-2 mb-6">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1.5 text-[11px] font-bold text-muted-foreground">
                  <BadgeCheck className="w-3.5 h-3.5 text-primary" />
                  Verified sellers only
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1.5 text-[11px] font-bold text-muted-foreground">
                  <BadgeCheck className="w-3.5 h-3.5 text-primary" />
                  No paid placements
                </span>
              </div>

              {/* socials */}
              <div className="flex items-center gap-2">
                {socials.map((s) => (
                  <a
                    key={s.label}
                    href={s.href}
                    aria-label={s.label}
                    className="p-2.5 rounded-xl border border-border/70 bg-background text-muted-foreground hover:bg-primary hover:text-white hover:border-primary transition-all hover:-translate-y-0.5"
                  >
                    {s.icon}
                  </a>
                ))}
              </div>
            </div>

            {/* link columns */}
            {linkGroups.map((g) => (
              <div key={g.title}>
                <h4 className="flex items-center gap-2 font-bold text-[13px] uppercase tracking-wider text-foreground/80 mb-4">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                  {g.title}
                </h4>
                <ul className="space-y-1 text-sm">
                  {g.links.map((l) => (
                    <li key={l.label}>
                      <Link
                        href={l.href}
                        className="group inline-flex items-center gap-1 text-muted-foreground hover:text-primary transition-colors py-1.5"
                      >
                        {l.label}
                        <ChevronRight className="w-3.5 h-3.5 opacity-0 -ml-1 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* bottom bar */}
          <div className="border-t border-border/60 py-5 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
            <p className="text-center md:text-left">
              As an <span className="font-semibold text-foreground/70">Amazon Associate</span>,
              Urban Deals earns from qualifying purchases — at no extra cost to you.
            </p>
            <div className="flex items-center gap-4">
              <p>&copy; {new Date().getFullYear()} Urban Deals</p>
              <button
                type="button"
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                aria-label="Back to top"
                className="shrink-0 w-9 h-9 rounded-xl border border-border bg-card text-muted-foreground hover:bg-primary hover:text-white hover:border-primary transition-colors flex items-center justify-center"
              >
                <ArrowUp className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
