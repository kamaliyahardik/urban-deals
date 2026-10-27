"use client";

import { Database, Cookie, Link2, ShieldCheck, UserX, Mail, Building2 } from "lucide-react";
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
    id: "who-we-are",
    title: "Who we are",
    Icon: Building2,
    body: (
      <>
        <P>
          Urban Deals (&ldquo;we&rdquo;, &ldquo;our&rdquo;, &ldquo;the site&rdquo;) is an
          independent shopping curation platform. We surface products listed on
          third-party marketplaces such as Amazon, Flipkart and Myntra along with
          research, ratings and editorial summaries to help you decide what to buy.
        </P>
        <P>
          This policy explains what little data the site handles, why, and the
          choices you have. The short version: we don&apos;t ask for personal
          information, we don&apos;t run our own ad network, and we don&apos;t sell
          anything.
        </P>
      </>
    ),
  },
  {
    id: "data-we-collect",
    title: "Data we collect",
    Icon: Database,
    body: (
      <>
        <P>Urban Deals is designed to work without creating accounts, so we collect:</P>
        <UL
          items={[
            "No names, emails or phone numbers — there is no registration on this site.",
            "No payment details — we never handle transactions; you buy directly on the marketplace.",
            "Anonymous, aggregate usage signals (page views, referral source) if analytics are enabled, which cannot be used to identify you.",
            "Comments or reviews you voluntarily submit are stored to display on the relevant product page.",
          ]}
        />
      </>
    ),
  },
  {
    id: "cookies",
    title: "Cookies & local storage",
    Icon: Cookie,
    body: (
      <>
        <P>
          We use strictly necessary browser storage for the site to function, and
          third-party marketplaces set their own cookies once you leave our site:
        </P>
        <UL
          items={[
            "Session storage / local storage: keeps administrators logged in and preserves your browsing preferences on this site.",
            "Marketplace cookies (Amazon, Flipkart, Myntra): when you click an outbound product link, those sites may set cookies — including affiliate-attribution cookies — governed by their own privacy policies.",
            "We do not use cookies to build advertising profiles of visitors.",
          ]}
        />
      </>
    ),
  },
  {
    id: "third-party-links",
    title: "Outbound links to marketplaces",
    Icon: Link2,
    body: (
      <>
        <P>
          Every &ldquo;View on Amazon&rdquo;-style button takes you to an external
          website. Once you are there, that marketplace&apos;s privacy policy applies
          to you — we have no access to, or control over, what they collect.
        </P>
        <P>
          We participate in affiliate programs (including the Amazon Associates
          Program), which means qualifying purchases through these links may earn us
          a commission. This happens at no extra cost to you and never influences
          which products we feature — see our Disclaimer for details.
        </P>
      </>
    ),
  },
  {
    id: "how-we-use",
    title: "How data is used",
    Icon: ShieldCheck,
    body: (
      <>
        <P>The limited information we hold is used only to:</P>
        <UL
          items={[
            "Operate and improve the product listings, ratings and summaries shown on the site.",
            "Understand aggregate traffic patterns so we can prioritise the categories people actually browse.",
            "Reply to messages you send us through the contact form.",
          ]}
        />
      </>
    ),
  },
  {
    id: "children",
    title: "Children's privacy",
    Icon: UserX,
    body: (
      <P>
        Urban Deals is intended for a general audience and is not directed at
        children under 13. We do not knowingly collect personal information from
        children. If you believe a child has provided us personal information,
        contact us and we will delete it promptly.
      </P>
    ),
  },
  {
    id: "contact",
    title: "Contact & changes",
    Icon: Mail,
    body: (
      <>
        <P>
          Policy questions, data requests or corrections can be sent through our{" "}
          <a href="/contact" className="text-primary font-semibold hover:underline">
            contact page
          </a>
          .
        </P>
        <P>
          We may update this policy as the site evolves. Material changes will be
          reflected in the &ldquo;last updated&rdquo; date at the top of this page.
        </P>
      </>
    ),
  },
];

export default function PrivacyPage() {
  return (
    <LegalPage
      eyebrow="Privacy Policy"
      title="Your privacy, kept simple."
      accentWord="simple"
      sub="No accounts, no tracking profiles, no data bazaar. Here is exactly what Urban Deals does and doesn't handle."
      updated="27 October 2026"
      sections={sections}
    />
  );
}
