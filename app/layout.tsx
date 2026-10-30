import React from "react";
import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MobileDock from "@/components/mobile-dock";

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Urban Deals — Smart Shopping, Honest Reviews | Amazon India",
    template: "%s | Urban Deals",
  },
  description:
    "Urban Deals curates top-rated Amazon India products with honest buyer reviews, real discounts and daily price checks. Compare, pick and save.",
  applicationName: "Urban Deals",
  keywords: [
    "Urban Deals",
    "Amazon India deals",
    "best products",
    "product reviews",
    "loot deals",
    "shopping deals India",
  ],
  alternates: {
    canonical: SITE_URL,
  },
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: "Urban Deals",
    title: "Urban Deals — Smart Shopping, Honest Reviews | Amazon India",
    description:
      "Urban Deals curates top-rated Amazon India products with honest buyer reviews, real discounts and daily price checks. Compare, pick and save.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Urban Deals — Smart Shopping, Honest Reviews | Amazon India",
    description:
      "Urban Deals curates top-rated Amazon India products with honest buyer reviews, real discounts and daily price checks. Compare, pick and save.",
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
