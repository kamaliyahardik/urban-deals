"use client";

import {
  Handshake,
  ShieldAlert,
  Link2,
  BadgeCheck,
  Mail,
  Scale,
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
    id: "affiliate-disclosure",
    title: "Affiliate disclosure",
    Icon: Handshake,
    body: (
      <>
        <P>
          Urban Deals is a participant in affiliate programs, including the Amazon
          Associates Program. As an Amazon Associate, we may earn a commission from
          qualifying purchases made through outbound product links — at{" "}
          <strong className="text-foreground">no additional cost to you</strong>.
        </P>
        <P>
          The same applies to links to Flipkart, Myntra and any other marketplace we
          feature. Commissions keep the site running and the research free; they do
          not change our ranking or the honest tone of our summaries.
        </P>
      </>
    ),
  },
  {
    id: "editorial-independence",
    title: "Editorial independence",
    Icon: BadgeCheck,
    body: (
      <>
        <P>
          Which products appear in our hero showcase, trending section or fresh
          drops is decided by our editorial team — not by advertisers, and not by
          commission rate. Higher commissions do not buy a better placement.
        </P>
        <P>
          Ratings, star values and review summaries shown on product pages are
          aggregated from the source marketplace at the time of curation and are
          presented for context, not as our personal warranty.
        </P>
      </>
    ),
  },
  {
    id: "accuracy",
    title: "Accuracy of information",
    Icon: ShieldAlert,
    body: (
      <>
        <P>
          We work hard to keep prices, availability, specifications and offers
          accurate, but details change constantly on marketplaces. Before you
          purchase, always verify the live price and terms on the marketplace page.
        </P>
        <UL
          items={[
            "Prices shown are indicative and can differ from the final checkout price.",
            "Specifications come from the marketplace listing and may be incomplete or outdated.",
            "We give no warranty — express or implied — about product quality, fitness or merchantability.",
          ]}
        />
      </>
    ),
  },
  {
    id: "external-sites",
    title: "External websites",
    Icon: Link2,
    body: (
      <>
        <P>
          We are not responsible for the content, pricing, shipping, refunds or any
          conduct of third-party marketplaces. Any transaction you make after
          leaving Urban Deals is between you and that marketplace.
        </P>
        <P>
          Trademarks and product images belong to their respective owners. Their
          appearance here is for identification and review purposes only.
        </P>
      </>
    ),
  },
  {
    id: "liability",
    title: "Limitation of liability",
    Icon: Scale,
    body: (
      <>
        <P>
          To the fullest extent permitted by law, Urban Deals — including its owners,
          editors and contributors — shall not be liable for any direct, indirect,
          incidental or consequential loss arising from your use of this site, the
          information on it, or any purchase you make on a third-party website.
        </P>
        <P>
          Using this site means you agree to this disclaimer together with our{" "}
          <a href="/terms" className="text-primary font-semibold hover:underline">
            Terms of Use
          </a>
          .
        </P>
      </>
    ),
  },
  {
    id: "contact",
    title: "Get in touch",
    Icon: Mail,
    body: (
      <P>
        Spot an incorrect price, a mislabelled spec, or want a product removed?
        Write to us via the{" "}
        <a href="/contact" className="text-primary font-semibold hover:underline">
          contact page
        </a>{" "}
        and we&apos;ll fix it quickly.
      </P>
    ),
  },
];

export default function DisclaimerPage() {
  return (
    <LegalPage
      eyebrow="Disclaimer"
      title="Straight answers, no fine-print games."
      accentWord="Straight"
      sub="Clear affiliate disclosure and honest limits — everything an affiliate site is required to tell you, in plain language."
      updated="27 October 2026"
      sections={sections}
    />
  );
}
