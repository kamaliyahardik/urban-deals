"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, ShoppingBag, Info, Mail } from "lucide-react";

const dockLinks = [
  { href: "/", label: "Home", icon: Home },
  { href: "/products", label: "Products", icon: ShoppingBag },
  { href: "/about", label: "About", icon: Info },
  { href: "/contact", label: "Contact", icon: Mail },
];

/**
 * App-style bottom dock (mobile only).
 * Renders the floating dock + a spacer so the footer is never covered.
 */
export default function MobileDock() {
  const pathname = usePathname();

  if (pathname?.startsWith("/admin")) return null;

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname?.startsWith(href) ?? false;

  return (
    <>
      {/* spacer so dock never covers footer content on mobile */}
      <div aria-hidden="true" className="h-[5.5rem] md:hidden" />

      <nav
        aria-label="Mobile navigation"
        className="md:hidden fixed bottom-0 inset-x-0 z-50 flex justify-center px-4 pb-[calc(env(safe-area-inset-bottom)+0.75rem)]"
      >
        <div className="w-full max-w-[22rem]">
          <div className="rounded-2xl border border-border bg-card/95 backdrop-blur-xl shadow-2xl shadow-zinc-950/15 px-2 py-1.5 grid grid-cols-4 gap-1">
            {dockLinks.map(({ href, label, icon: Icon }) => {
              const active = isActive(href);
              return (
                <Link
                  key={href}
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={`flex flex-col items-center justify-center gap-0.5 rounded-xl py-1.5 px-1 transition-all duration-300 active:scale-95 ${
                    active
                      ? "text-primary"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Icon className={`w-[1.15rem] h-[1.15rem] ${active ? "fill-primary/15" : ""}`} />
                  <span className="text-[9.5px] font-bold tracking-wide">
                    {label}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </nav>
    </>
  );
}
