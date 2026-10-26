import Link from "next/link";
import { Github, Instagram, Twitter, Youtube, Heart, MapPin } from "lucide-react";

const shopLinks = [
  { label: "All Products", href: "/products" },
  { label: "Electronics", href: "/products?category=electronics" },
  { label: "Fashion", href: "/products?category=fashion" },
  { label: "Home", href: "/products?category=home" },
  { label: "Kitchen", href: "/products?category=kitchen" },
];

const companyLinks = [
  { label: "About Us", href: "/about" },
  { label: "Contact", href: "/contact" },
  { label: "Add a Product", href: "/admin/login" },
];

const legalLinks = [
  { label: "Privacy Policy", href: "#" },
  { label: "Disclaimer", href: "#" },
  { label: "Terms of Use", href: "#" },
];

const socials = [
  { label: "X / Twitter", href: "#", icon: <Twitter className="w-4 h-4" /> },
  { label: "Instagram", href: "#", icon: <Instagram className="w-4 h-4" /> },
  { label: "YouTube", href: "#", icon: <Youtube className="w-4 h-4" /> },
  { label: "GitHub", href: "#", icon: <Github className="w-4 h-4" /> },
];

export default function Footer() {
  return (
    <footer className="relative mt-20">
      {/* Gradient hairline */}
      <div className="h-px w-full bg-gradient-to-r from-transparent via-violet-500/60 to-transparent" />

      <div className="glass rounded-t-3xl">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-8">
          <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
            {/* Brand */}
            <div>
              <Link href="/" className="inline-flex items-center gap-2.5 mb-4">
                <svg width="34" height="34" viewBox="0 0 40 40" fill="none">
                  <defs>
                    <linearGradient id="footGrad" x1="6" y1="6" x2="34" y2="34">
                      <stop offset="0%" stopColor="#8b5cf6" />
                      <stop offset="100%" stopColor="#d946ef" />
                    </linearGradient>
                  </defs>
                  <path
                    d="m12.75 8.3 6.75 3.884L26.25 8.3m-13.5 23.28v-7.755L6 19.94m27 0-6.75 3.885v7.754M6.405 12.408 19.5 19.954l13.095-7.546M19.5 35V19.94M33 25.914V13.962a2.98 2.98 0 0 0-1.5-2.585L21 5.4a3.01 3.01 0 0 0-3 0L7.5 11.377A3 3 0 0 0 6 13.962v11.953A2.98 2.98 0 0 0 7.5 28.5L18 34.477a3.01 3.01 0 0 0 3 0L31.5 28.5a3 3 0 0 0 1.5-2.585"
                    stroke="url(#footGrad)"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span className="font-bold text-lg bg-gradient-to-r from-violet-700 to-fuchsia-600 bg-clip-text text-transparent">
                  AffiliatePro
                </span>
              </Link>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-xs mb-5">
                Hand-picked deals from Amazon, Flipkart &amp; Myntra — honest
                specs, real reviews, smart prices.
              </p>
              <div className="flex items-center gap-2">
                {socials.map((s) => (
                  <a
                    key={s.label}
                    href={s.href}
                    aria-label={s.label}
                    className="p-2.5 rounded-xl border border-border/70 bg-card hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all hover:-translate-y-0.5"
                  >
                    {s.icon}
                  </a>
                ))}
              </div>
            </div>

            {/* Shop */}
            <div>
              <h4 className="font-bold text-sm uppercase tracking-wider text-foreground/80 mb-4">
                Shop
              </h4>
              <ul className="space-y-2.5 text-sm text-muted-foreground">
                {shopLinks.map((l) => (
                  <li key={l.label}>
                    <Link
                      href={l.href}
                      className="hover:text-primary hover:underline underline-offset-4 transition"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className="font-bold text-sm uppercase tracking-wider text-foreground/80 mb-4">
                Company
              </h4>
              <ul className="space-y-2.5 text-sm text-muted-foreground">
                {companyLinks.map((l) => (
                  <li key={l.label}>
                    <Link
                      href={l.href}
                      className="hover:text-primary hover:underline underline-offset-4 transition"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="font-bold text-sm uppercase tracking-wider text-foreground/80 mb-4">
                Legal
              </h4>
              <ul className="space-y-2.5 text-sm text-muted-foreground">
                {legalLinks.map((l) => (
                  <li key={l.label}>
                    <a
                      href={l.href}
                      className="hover:text-primary hover:underline underline-offset-4 transition"
                    >
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>
              <p className="flex items-center gap-1.5 text-xs text-muted-foreground mt-6">
                <MapPin className="w-3.5 h-3.5" /> Made with
                <Heart className="w-3 h-3 fill-rose-500 text-rose-500" />
                in India
              </p>
            </div>
          </div>

          {/* Disclosure + bottom bar */}
          <div className="mt-10 pt-6 border-t border-border/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
            <p>
              As an <span className="font-semibold">Amazon Associate</span>, we
              earn from qualifying purchases.
            </p>
            <p>&copy; {new Date().getFullYear()} AffiliatePro. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
