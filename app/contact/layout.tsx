import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Urban Deals",
  description:
    "Deal suggestions, price corrections or partnership inquiries — reach the Urban Deals team and we'll get back to you as soon as we can.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
