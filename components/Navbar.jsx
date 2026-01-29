"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const Navbar = () => {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = React.useState(false);

  if (pathname?.startsWith("/admin")) return null;

  return (
    <nav className="flex items-center justify-between gap-8 bg-wite/100 border border-white rounded-full px-4 md:px-2 py-2.5 w-full max-w-3xl">
      {/* Logo */}
      <Link href="/" className="flex items-center md:pl-3">
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
          <path
            d="m12.75 8.3 6.75 3.884L26.25 8.3m-13.5 23.28v-7.755L6 19.94m27 0-6.75 3.885v7.754M6.405 12.408 19.5 19.954l13.095-7.546M19.5 35V19.94M33 25.914V13.962a2.98 2.98 0 0 0-1.5-2.585L21 5.4a3.01 3.01 0 0 0-3 0L7.5 11.377A3 3 0 0 0 6 13.962v11.953A2.98 2.98 0 0 0 7.5 28.5L18 34.477a3.01 3.01 0 0 0 3 0L31.5 28.5a3 3 0 0 0 1.5-2.585"
            stroke="#7c3aed"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </Link>

      <div className="w-0.5 h-8 bg-gray-50 hidden md:flex"></div>

      {/* Menu */}
      <div
        className={`max-md:absolute max-md:bg-white/70 max-md:h-[785px] max-md:overflow-hidden max-md:transition-[width] max-md:duration-300 max-md:top-0 max-md:left-0 max-md:flex-col max-md:justify-center max-md:backdrop-blur z-50 md:gap-10 flex items-center justify-center gap-10 flex-1 ${
          mobileOpen ? "max-md:w-full" : "max-md:w-0"
        }`}
      >
        <Link
          href="/"
          onClick={() => setMobileOpen(false)}
          className="text-gray-600 hover:text-gray-700 text-sm"
        >
          Home
        </Link>

        <Link
          href="/about"
          onClick={() => setMobileOpen(false)}
          className="text-gray-600 hover:text-gray-700 text-sm"
        >
          About
        </Link>

        <Link
          href="/products"
          onClick={() => setMobileOpen(false)}
          className="text-gray-600 hover:text-gray-700 text-sm"
        >
          Products
        </Link>

        <Link
          href="/contact-us"
          onClick={() => setMobileOpen(false)}
          className="text-gray-600 hover:text-gray-700 text-sm"
        >
          Contact us
        </Link>

        {/* Close button */}
        <button
          onClick={() => setMobileOpen(false)}
          className="md:hidden bg-violet-500 active:bg-violet-600 text-white p-2 rounded-md aspect-square font-medium transition"
          type="button"
        >
          ✕
        </button>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-2 md:pr-1">
        <Link
          href="/"
          className="hidden md:inline-block bg-violet-600 hover:bg-violet-700 text-white px-4 md:px-6 py-2 md:py-3 rounded-full text-xs md:text-sm transition cursor-pointer"
        >
          Chakla koi di baaj no bane
        </Link>

        <button
          onClick={() => setMobileOpen(true)}
          className="md:hidden text-gray-700 p-2 rounded-md aspect-square font-medium transition"
          type="button"
        >
          ☰
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
