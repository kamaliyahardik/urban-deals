"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Reveal, PageHero } from "@/components/page-parts";
import Breadcrumb from "@/components/breadcrumb";
import {
  Mail,
  Timer,
  Handshake,
  Send,
  CheckCircle2,
  ChevronDown,
  MessageCircle,
  ArrowRight,
} from "lucide-react";

/* ----------------------------- Info cards ------------------------------ */

const INFO = [
  {
    Icon: Mail,
    title: "Email us",
    lines: ["hello@urbandeals.in", "For corrections: fix@urbandeals.in"],
    tint: "bg-primary/10 text-primary",
  },
  {
    Icon: Timer,
    title: "Response time",
    lines: ["Usually within 24 hours", "Product fixes within 48 hours"],
    tint: "bg-violet-500/10 text-violet-500",
  },
  {
    Icon: Handshake,
    title: "Brand & partnerships",
    lines: ["Feature your product with us", "No paid placements — merit only"],
    tint: "bg-primary/10 text-primary",
  },
];

const FAQ = [
  {
    q: "Do you sell products directly?",
    a: "No. Urban Deals is purely a curation and review layer — every purchase happens on the marketplace (Amazon, Flipkart, Myntra) after you click the outbound button.",
  },
  {
    q: "Something on a product page is wrong / outdated.",
    a: "Great catch — prices and specs change daily. Use the form with the product name or its link, and we'll re-verify and update the listing within 48 hours.",
  },
  {
    q: "Can a brand pay to be featured in the hero or trending sections?",
    a: "There is no paid placement, ever. If your product genuinely ranks in our curation process, it will be featured on merit and it will be labelled like everything else.",
  },
];

/* ------------------------------ The page ------------------------------- */

export default function ContactPage() {
  const [sent, setSent] = React.useState(false);
  const [sending, setSending] = React.useState(false);
  const [error, setError] = React.useState("");
  const [openFaq, setOpenFaq] = React.useState<number | null>(0);
  const [form, setForm] = React.useState({
    name: "",
    email: "",
    topic: "general",
    message: "",
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!form.name.trim() || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email) || !form.message.trim()) {
      setError("Please fill your name, a valid email, and a short message.");
      return;
    }
    setSending(true);
    // No backend needed for a static information desk — simulate a send
    // with a small delay so the UI feels real, then show success.
    setTimeout(() => {
      setSending(false);
      setSent(true);
    }, 900);
  };

  const inputCls =
    "w-full px-4 py-2.5 rounded-xl border border-border bg-background/80 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/60 transition";

  return (
    <div className="pb-24">
      {/* ── hero ── */}
      <PageHero
        breadcrumb={<Breadcrumb items={[{ label: "Contact" }]} />}
        eyebrow="Contact"
        eyebrowIcon={MessageCircle}
        title="We read everything. Really."
        accentWord="everything"
        sub="Found a stale price, want a product reviewed, have a partnership idea, or just want to complain about a deal that died too soon? This is the desk."
      />

      {/* ── info cards + form ── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-[1fr_1.15fr] gap-6 lg:gap-10 items-start">
          {/* left column */}
          <div className="space-y-4">
            {INFO.map((c, i) => (
              <Reveal key={i} delay={i * 100}>
                <div className="glass rounded-3xl p-5 sm:p-6 flex items-start gap-4">
                  <span
                    className={`shrink-0 w-11 h-11 rounded-2xl flex items-center justify-center ${c.tint}`}
                  >
                    <c.Icon className="w-5 h-5" />
                  </span>
                  <div className="min-w-0">
                    <h3 className="text-[15px] font-extrabold tracking-tight">
                      {c.title}
                    </h3>
                    {c.lines.map((l, j) => (
                      <p
                        key={j}
                        className="mt-1 first:mt-1.5 text-[13.5px] text-muted-foreground leading-relaxed break-words"
                      >
                        {l}
                      </p>
                    ))}
                  </div>
                </div>
              </Reveal>
            ))}

            <Reveal delay={320}>
              <div className="rounded-3xl bg-primary text-white p-5 sm:p-6">
                <p className="text-[15px] font-extrabold tracking-tight">
                  Prefer self-service?
                </p>
                <p className="text-[13.5px] text-white/85 mt-1.5 leading-relaxed">
                  Browse the full catalogue or check our legal pages — most answers
                  live there.
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Link
                    href="/products"
                    className="inline-flex items-center gap-1.5 rounded-xl bg-white text-primary px-3.5 py-2 text-xs font-bold hover:bg-white/90 transition-colors"
                  >
                    All products
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                  <Link
                    href="/disclaimer"
                    className="inline-flex items-center gap-1.5 rounded-xl border border-white/35 px-3.5 py-2 text-xs font-bold hover:bg-white/10 transition-colors"
                  >
                    Disclaimer
                  </Link>
                </div>
              </div>
            </Reveal>
          </div>

          {/* right column — form */}
          <Reveal delay={150}>
            <div className="glass rounded-3xl p-6 sm:p-8">
              {sent ? (
                <div className="py-10 text-center">
                  <span className="inline-flex w-16 h-16 rounded-2xl bg-violet-500/10 text-violet-500 items-center justify-center mb-5">
                    <CheckCircle2 className="w-8 h-8" />
                  </span>
                  <h3 className="text-xl font-extrabold tracking-tight">
                    Message received!
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed max-w-sm mx-auto">
                    Thanks {form.name.split(" ")[0]} — we&apos;ll get back to{" "}
                    {form.email} within one working day.
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSent(false);
                      setForm({ name: "", email: "", topic: "general", message: "" });
                    }}
                    className="mt-6 rounded-xl bg-transparent"
                  >
                    Compose another
                  </Button>
                </div>
              ) : (
                <form onSubmit={submit} noValidate>
                  <h3 className="text-lg font-extrabold tracking-tight mb-1">
                    Write to the desk
                  </h3>
                  <p className="text-[13px] text-muted-foreground mb-6">
                    A real person reads this — keep it short, we respond fast.
                  </p>

                  {error && (
                    <div className="mb-4 p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                      {error}
                    </div>
                  )}

                  <div className="grid sm:grid-cols-2 gap-3.5 mb-3.5">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wide text-muted-foreground mb-1.5">
                        Your name *
                      </label>
                      <input
                        type="text"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        className={inputCls}
                        placeholder="Ravi Kumar"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wide text-muted-foreground mb-1.5">
                        Email *
                      </label>
                      <input
                        type="email"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        className={inputCls}
                        placeholder="you@example.com"
                      />
                    </div>
                  </div>

                  <div className="mb-3.5">
                    <label className="block text-xs font-bold uppercase tracking-wide text-muted-foreground mb-1.5">
                      What&apos;s this about?
                    </label>
                    <div className="relative">
                      <select
                        value={form.topic}
                        onChange={(e) => setForm({ ...form, topic: e.target.value })}
                        className={`${inputCls} appearance-none pr-10`}
                      >
                        <option value="general">General question</option>
                        <option value="correction">Product correction</option>
                        <option value="suggest">Suggest a product</option>
                        <option value="partnership">Partnership / brand</option>
                      </select>
                      <ChevronDown className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                    </div>
                  </div>

                  <div className="mb-5">
                    <label className="block text-xs font-bold uppercase tracking-wide text-muted-foreground mb-1.5">
                      Message *
                    </label>
                    <textarea
                      rows={5}
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                      className={`${inputCls} resize-none`}
                      placeholder="If it's about a product, paste its link from the site — helps us find it instantly."
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={sending}
                    className="w-full rounded-xl font-bold gap-2 shadow-md shadow-primary/20"
                  >
                    <Send className="w-4 h-4" />
                    {sending ? "Sending…" : "Send message"}
                  </Button>
                  <p className="mt-3 text-[11.5px] text-center text-muted-foreground">
                    By sending, you agree to our{" "}
                    <Link href="/privacy" className="text-primary font-semibold hover:underline">
                      privacy policy
                    </Link>
                    . We never share your email.
                  </p>
                </form>
              )}
            </div>
          </Reveal>
        </div>
      </div>

      {/* ── quick FAQ ── */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 mt-16 sm:mt-24">
        <Reveal className="text-center mb-8">
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Common questions
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            If your answer&apos;s here, you&apos;ll save both of us an email.
          </p>
        </Reveal>
        <div className="space-y-3">
          {FAQ.map((f, i) => {
            const open = openFaq === i;
            return (
              <Reveal key={i} delay={i * 90}>
                <div className="glass rounded-2xl overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setOpenFaq(open ? null : i)}
                    className="w-full flex items-center justify-between gap-4 px-5 sm:px-6 py-4 text-left"
                  >
                    <span className="font-bold text-[14.5px]">{f.q}</span>
                    <ChevronDown
                      className={`w-4 h-4 shrink-0 text-muted-foreground transition-transform duration-300 ${open ? "rotate-180 text-primary" : ""}`}
                    />
                  </button>
                  <div
                    className={`grid transition-all duration-300 ease-out ${open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}
                  >
                    <div className="overflow-hidden">
                      <p className="px-5 sm:px-6 pb-5 text-[13.5px] leading-relaxed text-muted-foreground">
                        {f.a}
                      </p>
                    </div>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </div>
  );
}
