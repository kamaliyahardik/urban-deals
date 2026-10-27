"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { BrandMark } from "@/components/Logo";
import { clearAdminSession } from "@/lib/admin-auth";
import {
  LayoutDashboard,
  ListChecks,
  LayoutGrid,
  ExternalLink,
  LogOut,
  Menu,
  X,
} from "lucide-react";

const NAV_ITEMS = [
  {
    href: "/admin/dashboard",
    label: "Overview",
    Icon: LayoutDashboard,
    exact: true,
  },
  {
    href: "/admin/dashboard/products",
    label: "Products",
    Icon: ListChecks,
    exact: false,
  },
  {
    href: "/admin/dashboard/categories",
    label: "Categories",
    Icon: LayoutGrid,
    exact: false,
  },
];

function isActive(pathname: string | null, href: string, exact: boolean) {
  if (!pathname) return false;
  if (exact) return pathname === href;
  return pathname.startsWith(href);
}

export default function AdminShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = React.useState(false);

  // Close drawer on navigation
  React.useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Lock scroll + Escape while drawer open
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  const handleLogout = async () => {
    clearAdminSession();
    router.push("/admin/login");
  };

  const navList = (onNavigate?: () => void) => (
    <nav className="flex flex-col gap-1.5">
      {NAV_ITEMS.map(({ href, label, Icon, exact }) => {
        const active = isActive(pathname, href, exact);
        return (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={`group flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
              active
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-secondary/70"
            }`}
          >
            <span
              className={`shrink-0 w-7 h-7 rounded-lg flex items-center justify-center ${
                active
                  ? "bg-white/15 text-inherit"
                  : "bg-secondary text-muted-foreground group-hover:text-primary"
              }`}
            >
              <Icon className="w-4 h-4" />
            </span>
            {label}
          </Link>
        );
      })}
    </nav>
  );

  const footer = (onNavigate?: () => void) => (
    <div className="mt-auto flex flex-col gap-1.5">
      <Link
        href="/"
        target="_blank"
        onClick={onNavigate}
        className="flex items-center gap-3 px-4 py-2.5 rounded-2xl text-sm font-semibold text-muted-foreground hover:text-primary hover:bg-secondary/70 transition-all"
      >
        <span className="w-8 h-8 rounded-xl bg-secondary flex items-center justify-center">
          <ExternalLink className="w-4 h-4" />
        </span>
        View live site
      </Link>
      <button
        type="button"
        onClick={handleLogout}
        className="flex items-center gap-3 px-4 py-2.5 rounded-2xl text-sm font-bold text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all active:scale-[0.98]"
      >
        <span className="w-8 h-8 rounded-xl bg-secondary group-hover:bg-destructive/10 flex items-center justify-center">
          <LogOut className="w-4 h-4" />
        </span>
        Logout
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-card/30 to-background">
      {/* ── Desktop sidebar ─────────────────────────────────── */}
      <aside className="hidden lg:flex fixed left-0 top-0 bottom-0 w-56 z-40 flex-col p-3.5 border-r border-border/60 glass rounded-none border-y-0 border-l-0">
        <Link href="/admin/dashboard" className="flex items-center gap-2.5 px-2 py-3 mb-4">
          <BrandMark className="w-9 h-9 text-primary shrink-0" />
          <span className="flex flex-col leading-none">
            <span className="flex items-start">
              <span className="font-extrabold tracking-[0.08em] text-[15px]">URBAN</span>
              <span className="text-[8px] font-bold text-primary ml-0.5 mt-0.5">®</span>
            </span>
            <span className="font-light tracking-[0.28em] text-[10px] text-primary mt-0.5">
              DEALS · ADMIN
            </span>
          </span>
        </Link>

        <p className="px-4 mb-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">
          Menu
        </p>
        {navList()}

        <div className="h-px bg-border/60 my-3 w-full" />
        {footer()}
      </aside>

      {/* ── Mobile top bar ──────────────────────────────────── */}
      <div className="lg:hidden glass sticky top-0 z-40 rounded-none border-x-0 border-t-0">
        <div className="h-16 px-4 flex items-center justify-between gap-3">
          <Link href="/admin/dashboard" className="flex items-center gap-2.5 min-w-0">
            <BrandMark className="w-8 h-8 text-primary shrink-0" />
            <span className="font-extrabold tracking-[0.08em] text-sm">
              URBAN
              <span className="text-[8px] font-bold text-primary ml-0.5 align-super">®</span>{" "}
              <span className="text-primary font-light tracking-[0.24em]">DEALS</span>
            </span>
          </Link>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            className={`p-2.5 rounded-xl border shadow-sm transition-all duration-300 active:scale-90 ${
              open
                ? "border-primary/40 bg-primary text-primary-foreground"
                : "border-border bg-card text-foreground"
            }`}
          >
            <span className="relative block w-5 h-5">
              <X
                className={`w-5 h-5 absolute inset-0 transition-all duration-300 ${
                  open ? "opacity-100 rotate-0" : "opacity-0 -rotate-90"
                }`}
              />
              <Menu
                className={`w-5 h-5 absolute inset-0 transition-all duration-300 ${
                  open ? "opacity-0 rotate-90" : "opacity-100 rotate-0"
                }`}
              />
            </span>
          </button>
        </div>
      </div>

      {/* ── Mobile drawer ───────────────────────────────────── */}
      <div
        aria-hidden="true"
        onClick={() => setOpen(false)}
        className={`lg:hidden fixed inset-0 z-40 bg-zinc-950/40 backdrop-blur-sm transition-opacity duration-300 ${
          open ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      />
      <aside
        className={`lg:hidden fixed left-0 top-0 bottom-0 z-50 w-[270px] glass rounded-r-3xl flex flex-col p-4 transition-transform duration-300 ease-out will-change-transform ${
          open ? "translate-x-0" : "-translate-x-full pointer-events-none"
        }`}
      >
        <Link href="/admin/dashboard" className="flex items-center gap-2.5 px-2 py-3 mb-4">
          <BrandMark className="w-9 h-9 text-primary shrink-0" />
          <span className="flex flex-col leading-none">
            <span className="flex items-start">
              <span className="font-extrabold tracking-[0.08em] text-[15px]">URBAN</span>
              <span className="text-[8px] font-bold text-primary ml-0.5 mt-0.5">®</span>
            </span>
            <span className="font-light tracking-[0.28em] text-[10px] text-primary mt-0.5">
              DEALS · ADMIN
            </span>
          </span>
        </Link>

        <p className="px-4 mb-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">
          Menu
        </p>
        {navList(() => setOpen(false))}

        <div className="h-px bg-border/60 my-3 w-full" />
        {footer(() => setOpen(false))}
      </aside>

      {/* ── Content ─────────────────────────────────────────── */}
      <div className="lg:pl-56 min-h-screen flex flex-col">
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
