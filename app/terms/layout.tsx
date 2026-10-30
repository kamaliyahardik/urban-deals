import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Use",
  description:
    "The ground rules for using Urban Deals — content rights, affiliate relationships and the limits of our liability, in plain English.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
