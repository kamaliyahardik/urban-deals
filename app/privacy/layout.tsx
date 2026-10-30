import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How Urban Deals collects, uses and protects your data — cookies, analytics and affiliate disclosures, explained in plain language.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
