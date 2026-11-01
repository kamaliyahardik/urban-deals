import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Disclaimer",
  description:
    "How Urban Deals handles pricing accuracy, affiliate links and product information — what we verify and what can change on the store.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
