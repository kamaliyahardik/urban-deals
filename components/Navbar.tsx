"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Zap } from "lucide-react";
import { BrandMark } from "@/components/Logo";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/products", label: "Products" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

const Navbar = () => {
  const pathname = usePathname();
  const listRef = React.useRef<HTMLDivElement>(null);
  const [pill, setPill] = React.useState({ left: 0, width: 0, opacity: 0 });

  if (pathname?.startsWith("/admin")) return null;

  const isActive = (href: string) =>
    (href === "/" ? pathname === "/" : pathname?.startsWith(href)) ?? false;

  // measure the active link so the violet pill can GLIDE between items
  React.useEffect(() => {
    const measure = () => {
      const list = listRef.current;
      if (!list) return;
      const active = list.querySelector<HTMLElement>('[data-active="true"]');
      if (active) {
        const menuRect = list.getBoundingClientRect();
        const rect = active.getBoundingClientRect();
        setPill({
          left: rect.left - menuRect.left,
          width: rect.width,
          opacity: 1,
        });
      } else {
        setPill((p) => ({ ...p, opacity: 0 }));
      }
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [pathname]);

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

      {/* Desktop menu — the active pill glides between items */}
      <div
        ref={listRef}
        className="hidden md:flex relative items-center gap-1 bg-secondary/60 rounded-full px-1.5 py-1"
      >
        {/* sliding pill */}
        <span
          aria-hidden="true"
          style={{ left: pill.left, width: pill.width, opacity: pill.opacity }}
          className="absolute top-1 bottom-1 rounded-full bg-primary shadow-sm transition-all duration-300 ease-out"
        />
        {navLinks.map((l) => {
          const active = isActive(l.href);
          return (
            <Link
              key={l.href}
              href={l.href}
              data-active={active}
              className={`relative z-10 px-4 py-1.5 rounded-full text-sm font-medium transition-colors duration-300 ${
                active
                  ? "text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {l.label}
            </Link>
          );
        })}
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
