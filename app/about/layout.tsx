import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Urban Deals — Our Review Process",
  description:
    "How every deal on Urban Deals is vetted — specs, real buyer reviews and live prices — and how affiliate commissions keep the site free and independent.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
