"use client";

import {
  BookOpenCheck,
  MousePointerClick,
  Scale,
  Copyright,
  ShieldCheck,
  RefreshCw,
  Landmark,
} from "lucide-react";
import { LegalPage, type LegalSection } from "@/components/legal-page";

const P = ({ children }: { children: React.ReactNode }) => <p>{children}</p>;
const UL = ({ items }: { items: string[] }) => (
  <ul className="list-disc pl-5 space-y-1.5 marker:text-primary/60">
    {items.map((t, i) => (
      <li key={i}>{t}</li>
    ))}
  </ul>
);

const sections: LegalSection[] = [
  {
    id: "acceptance",
    title: "Acceptance of terms",
    Icon: BookOpenCheck,
    body: (
      <>
        <P>
          By browsing Urban Deals you agree to these Terms of Use together with our{" "}
          <a href="/privacy" className="text-primary font-semibold hover:underline">
            Privacy Policy
          </a>{" "}
          and{" "}
          <a href="/disclaimer" className="text-primary font-semibold hover:underline">
            Disclaimer
          </a>
          . If you disagree with any part, please stop using the site.
        </P>
        <P>
          These terms apply to every visitor. No separate agreement is required
          because the site needs no registration, login or purchase from us.
        </P>
      </>
    ),
  },
  {
    id: "acceptable-use",
    title: "Acceptable use",
    Icon: MousePointerClick,
    body: (
      <>
        <P>You agree not to misuse the service. In particular:</P>
        <UL
          items={[
            "Don't attempt to breach, overload, scrape aggressively or disrupt the site or its data sources.",
            "Don't republish large parts of our curated summaries without attribution or permission.",
            "Don't use automated systems to distort ratings, reviews or listings displayed here.",
            "Comply with all applicable laws while using the site.",
          ]}
        />
        <P>
          We may terminate access or block traffic that violates this section, with
          or without notice.
        </P>
      </>
    ),
  },
  {
    id: "intellectual-property",
    title: "Intellectual property",
    Icon: Copyright,
    body: (
      <>
        <P>
          The Urban Deals brand, logo, layout, curated summaries and editorial
          content are ours. You're welcome to link to any page and even quote short
          excerpts with a clear citation back to us.
        </P>
        <P>
          Product names, images, trademarks and marketplace content belong to their
          respective owners and are used here only for identification, commentary
          and review purposes.
        </P>
      </>
    ),
  },
  {
    id: "third-party-transactions",
    title: "Purchases happen on third-party sites",
    Icon: ShieldCheck,
    body: (
      <>
        <P>
          Urban Deals is an information platform — we never sell products, process
          payments or ship anything. Every buy button opens the product page on the
          marketplace (Amazon, Flipkart, Myntra, etc.), where a separate{" "}
          <strong className="text-foreground">
            transaction between you and that marketplace
          </strong>{" "}
          takes place under their own terms, pricing, refund and delivery policies.
        </P>
        <P>
          We make no representation about any marketplace listing and express no
          warranty about any product you decide to purchase.
        </P>
      </>
    ),
  },
  {
    id: "no-warranty",
    title: "The service is provided as-is",
    Icon: Scale,
    body: (
      <>
        <P>
          Urban Deals and its content are provided &ldquo;as is&rdquo; and
          &ldquo;as available&rdquo; without warranties of any kind, whether express
          or implied — including fitness for a particular purpose, accuracy or
          non-infringement.
        </P>
        <P>
          We do not promise the site will be uninterrupted, error-free or that
          listing data from marketplaces will always be current.
        </P>
      </>
    ),
  },
  {
    id: "liability",
    title: "Limitation of liability",
    Icon: Landmark,
    body: (
      <P>
        To the maximum extent permitted by law, our total liability to you for any
        claim relating to the site shall not exceed one hundred rupees (₹100) or
        such other amount as applicable law requires, whichever is less. We shall
        not be liable for missed deals, pricing errors, or any purchase made on a
        third-party website reached through our links.
      </P>
    ),
  },
  {
    id: "changes",
    title: "Changes to these terms",
    Icon: RefreshCw,
    body: (
      <P>
        We may revise these terms as features change. The current version is always
        available on this page, and the &ldquo;last updated&rdquo; date shows when
        it changed. Continuing to use the site after an update means you accept the
        revised terms.
      </P>
    ),
  },
];

export default function TermsPage() {
  return (
    <LegalPage
      eyebrow="Terms of Use"
      title="The rules of the house."
      accentWord="rules"
      sub="Short, readable terms for using Urban Deals — what you can expect from us, and what we expect in return."
      updated="27 October 2026"
      sections={sections}
    />
  );
}
