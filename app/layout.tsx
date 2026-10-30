import React from "react";
import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MobileDock from "@/components/mobile-dock";
import { getSiteUrl, PROD_URL } from "@/lib/site";

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

const SITE_URL = getSiteUrl();

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default:
      "Best Amazon India Deals, Reviews & Diwali Gift Guide | Urban Deals",
    template: "%s | Urban Deals",
  },
  description:
    "The best deals on Amazon India — top products, honest reviews, Diwali gift ideas and festive watch deals, curated with daily price checks.",
  applicationName: "Urban Deals",
  keywords: [
    "Urban Deals",
    "Amazon India deals",
    "amazon deals india",
    "best products",
    "product reviews",
    "loot deals",
    "shopping deals India",
    "best diwali gifts",
    "diwali gifts 2026",
    "diwali watches",
    "festive deals",
  ],
  alternates: {
    canonical: SITE_URL,
  },
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: "Urban Deals",
    title: "Best Amazon India Deals, Reviews & Diwali Gift Guide | Urban Deals",
    description:
      "The best deals on Amazon India — top products, honest reviews, Diwali gift ideas and festive watch deals, curated with daily price checks.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Best Amazon India Deals, Reviews & Diwali Gift Guide | Urban Deals",
    description:
      "The best deals on Amazon India — top products, honest reviews, Diwali gift ideas and festive watch deals, curated with daily price checks.",
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: "/apple-icon.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#7c3aed",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`font-sans antialiased`} suppressHydrationWarning>
        {/* Organization + WebSite structured data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify([
              {
                "@context": "https://schema.org",
                "@type": "Organization",
                name: "Urban Deals",
                url: PROD_URL,
                logo: `${PROD_URL}/icon-512.png`,
              },
              {
                "@context": "https://schema.org",
                "@type": "WebSite",
                name: "Urban Deals",
                url: PROD_URL,
                potentialAction: {
                  "@type": "SearchAction",
                  target: `${PROD_URL}/products?q={search_term_string}`,
                  "query-input": "required name=search_term_string",
                },
              },
            ]),
          }}
        />
        <div className="fixed top-6 w-full flex justify-center z-50 pointer-events-none px-3">
          <div className="pointer-events-auto w-fit md:w-full max-w-4xl">
            <Navbar />
          </div>
        </div>
        {children}
        <Footer />
        <MobileDock />
        <Analytics />
      </body>
    </html>
  );
}
