"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Zap } from "lucide-react";
import { BrandMark } from "@/components/Logo";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/products", label: "Products" },
  { href: "/category/electronics", label: "Electronics" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

const Navbar = () => {
  const pathname = usePathname();

  if (pathname?.startsWith("/admin")) return null;

  const isActive = (href: string) =>
    (href === "/" ? pathname === "/" : pathname?.startsWith(href)) ?? false;

  return (
    <nav className="rounded-2xl bg-card/95 backdrop-blur-xl border border-border px-3 md:px-4 py-2.5 w-fit md:w-full flex items-center justify-center md:justify-between gap-4 shadow-xl shadow-zinc-950/10">
      {/* Brand — the only thing in the bar on mobile, pill hugs the logo */}
      <Link href="/" className="flex items-center gap-2 sm:gap-2.5 md:pr-2">
        <BrandMark className="w-8 h-8 sm:w-9 sm:h-9 text-primary shrink-0" />
        <span className="flex flex-col leading-none">
          <span className="flex items-start">
            <span className="font-extrabold tracking-[0.08em] text-[13px] sm:text-[15px]">
              URBAN
            </span>
            <span className="text-[7px] sm:text-[8px] font-bold text-primary ml-0.5 mt-0.5">
              ®
            </span>
          </span>
          <span className="font-light tracking-[0.28em] sm:tracking-[0.32em] text-[9px] sm:text-[11px] text-primary mt-0.5">
            DEALS
          </span>
        </span>
      </Link>

      {/* Desktop menu — mobile nav lives in the bottom dock */}
      <div className="hidden md:flex items-center gap-1 bg-secondary/60 rounded-full px-1.5 py-1">
        {navLinks.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
              isActive(l.href)
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {l.label}
          </Link>
        ))}
      </div>

      {/* Desktop CTA */}
      <Link
        href="/products"
        className="hidden md:inline-flex items-center gap-1.5 bg-primary hover:bg-primary/90 text-white px-4 md:px-5 py-2.5 rounded-xl text-sm font-semibold shadow-md shadow-primary/20 transition active:scale-95"
      >
        <Zap className="w-4 h-4 fill-white" />
        Grab Deals
      </Link>
    </nav>
  );
};

export default Navbar;
