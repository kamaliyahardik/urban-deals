import { Suspense } from "react";
import type { Metadata } from "next";
import ProductsListing from "./listing";

export const metadata: Metadata = {
  title: "Best Amazon India Deals & Top-Rated Picks",
  description:
    "Hand-picked Amazon India deals at live prices — honest product reviews, big discounts, watch deals & Diwali gift ideas 2026. Filter, sort and grab the best price.",
  alternates: { canonical: "/products" },
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    title: "Best Amazon India Deals & Top-Rated Picks — Urban Deals",
    description:
      "Hand-picked Amazon India deals at live prices — honest product reviews, big discounts, watch deals & Diwali gift ideas 2026. Filter, sort and grab the best price.",
  },
};

export default function ProductsPage() {
  return (
    <Suspense fallback={null}>
      <ProductsListing />
    </Suspense>
  );
}
