import type { Metadata } from "next";

export const metadata: Metadata = { title: "Disclaimer — Urban Deals" };

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
