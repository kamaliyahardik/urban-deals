/**
 * Server-side product info fetcher for affiliate product pages.
 * Supports Amazon (.in/.com/etc), Flipkart and Myntra, with a generic
 * JSON-LD / Open Graph fallback that works on many other stores.
 */

export interface ReviewDraft {
  author: string;
  rating: number | null;
  title: string;
  body: string;
  date: string | null;
}

export interface SpecDraft {
  key: string;
  value: string;
}

export interface ProductDraft {
  name: string;
  description: string;
  price: number | null;
  mrp: number | null;
  discount_percent: number | null;
  currency: string;
  brand: string;
  sku: string;
  availability: string;
  rating: number | null;
  review_count: number | null;
  image_url: string;
  images: string[];
  features: string[];
  specs: SpecDraft[];
  reviews: ReviewDraft[];
  source: string;
  canonical_url: string;
  /** Guessed Urban Deals category slug ("watches"…) — "" when unknown. */
  category: string;
  /** Raw category path found on the store page (for display/debug). */
  breadcrumbs: string[];
}

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

const ENTITIES: Record<string, string> = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  nbsp: " ",
  rsquo: "\u2019",
  lsquo: "\u2019",
  ldquo: "\u201C",
  rdquo: "\u201D",
  mdash: "\u2014",
  ndash: "\u2013",
  hellip: "\u2026",
  rupee: "\u20B9",
  deg: "\u00B0",
};

export function decodeEntities(input: string): string {
  return input
    .replace(
      /&(?:#x([0-9a-fA-F]+)|#(\d+)|([a-zA-Z][a-zA-Z0-9]*));/g,
      (_m, hex, dec, name) => {
        if (hex) return String.fromCodePoint(parseInt(hex, 16));
        if (dec) return String.fromCodePoint(parseInt(dec, 10));
        return ENTITIES[name] ?? `&${name};`;
      },
    )
    .replace(/\u00A0/g, " ");
}

function stripTags(html: string): string {
  return decodeEntities(
    html
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<[^>]+>/g, " "),
  );
}

export function cleanText(input: string | null | undefined): string {
  if (!input) return "";
  return decodeEntities(String(input))
    .replace(/[\u200B\u200E\u200F\uFEFF]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Parse a possibly dirty price string ("₹ 39,999.00", "$1,299", "Rs.399") */
export function parsePrice(raw: string | null | undefined): number | null {
  if (!raw) return null;
  const cleaned = String(raw)
    .replace(/[\u00A0\s]/g, "")
    .replace(/[^\d.,-]/g, "");
  // Prefer a dot-decimal / comma-as-thousands format
  const numeric = cleaned.replace(/,/g, "").replace(/[^\d.]/g, "");
  const n = parseFloat(numeric);
  if (!Number.isFinite(n) || n <= 0) return null;
  return n;
}

function detectCurrency(html: string, site: string): string {
  // Rupee sign anywhere in the page is a strong India signal
  if (site === "amazon" || site === "flipkart" || site === "myntra") {
    if (/₹|\u20B9|\bINR\b|\bRs\.?\b/i.test(html)) return "INR";
    return "INR"; // these three are India-first stores
  }
  if (/₹|\u20B9|\bINR\b|\bRs\.?\b/.test(html)) return "INR";
  if (/priceCurrency["']?\s*:\s*["']USD/.test(html)) return "USD";
  if (/\$\s?\d|USD/.test(html)) return "USD";
  if (/€|EUR/.test(html)) return "EUR";
  if (/£|GBP/.test(html)) return "GBP";
  return "INR";
}

function absoluteUrl(base: string, src: string | null | undefined): string {
  if (!src) return "";
  const s = src.trim().replace(/^\/\//, "https://");
  try {
    if (s.startsWith("http")) return s;
    return new URL(s, base).toString();
  } catch {
    return "";
  }
}

/** Normalize store image URLs — resolve size placeholders, force https. */
function normalizeImage(u: string): string {
  let out = u.trim();
  // Myntra dynamic template: h_($height),q_($qualityPercentage),w_($width)
  if (out.includes("($height)")) {
    out = out.replace(/h_\(\$height\),q_\(\$qualityPercentage\),w_\(\$width\)/, "h_1280,w_1280,q_90");
  }
  // Flipkart /image/1280/1280/ upgrade for any small-size OG image
  out = out.replace(
    /(rukminim\d*\.flixcart\.com\/image)\/\d+\/\d+\//,
    "$1/1280/1280/",
  );
  if (out.startsWith("http://")) out = "https://" + out.slice(7);
  return out;
}

/** Group near-identical images (same photo at different sizes) and keep the
 *  highest-quality variant of each. */
function dedupeImagesSimilar(list: string[]): string[] {
  const best = new Map<string, { url: string; size: number }>();
  for (const rawUrl of list) {
    const url = normalizeImage(rawUrl);
    if (!url) continue;
    // Canonical key: strip size hints and extensions
    const key = url
      .replace(/([/._])(SL\d+|AC_.*?|_SR\d+)/g, "$1")
      .replace(/\._[^.]+\.(jpg|png|webp)/i, "")
      .replace(/\/(\d+)\/(\d+)\//g, "/")
      .replace(/h_\d+(,q_\d+)?,w_\d+\//g, "")
      .split("?")[0]
      .replace(/\.(jpg|jpeg|png|webp)$/i, "")
      .toLowerCase();
    // Size heuristic — the biggest number is usually the width
    const numHints = (url.match(/(?:SL|\d{2,})/g) || [])
      .map(Number)
      .filter((n) => n >= 100 && n <= 4000);
    const size = numHints.length ? Math.max(...numHints) : 0;
    const prev = best.get(key);
    if (!prev || size > prev.size || (size === prev.size && url.length > prev.url.length)) {
      best.set(key, { url, size });
    }
  }
  return [...best.values()].map((e) => e.url);
}

function uniqueKeepOrder(list: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const item of list) {
    if (item && !seen.has(item)) {
      seen.add(item);
      out.push(item);
    }
  }
  return out;
}

/**
 * Extract a complete balanced {…} JSON object starting at position of
 * `html[start]` (should be "{"). Handles strings/escapes correctly.
 */
function extractBalancedObject(html: string, startOfBrace: number): string | null {
  let depth = 0;
  let inString = false;
  let escaped = false;
  for (let i = startOfBrace; i < html.length; i++) {
    const ch = html[i];
    if (escaped) {
      escaped = false;
      continue;
    }
    if (ch === "\\") {
      if (inString) escaped = true;
      continue;
    }
    if (ch === '"') {
      inString = !inString;
      continue;
    }
    if (inString) continue;
    if (ch === "{") depth++;
    else if (ch === "}") {
      depth--;
      if (depth === 0) return html.slice(startOfBrace, i + 1);
    }
  }
  return null;
}

interface JsonLdProduct {
  name?: string;
  image?: string | string[];
  description?: string;
  brand?: string | { name?: string } | string[];
  sku?: string;
  offers?:
    | {
        price?: string | number;
        priceCurrency?: string;
        highPrice?: string | number;
        availability?: string;
      }
    | Array<{
        price?: string | number;
        priceCurrency?: string;
        highPrice?: string | number;
        availability?: string;
      }>;
  aggregateRating?: {
    ratingValue?: string | number;
    reviewCount?: string | number;
    ratingCount?: string | number;
  };
  review?: Array<{
    reviewBody?: string;
    datePublished?: string;
    author?: string | { name?: string };
    reviewRating?: {
      ratingValue?: string | number;
      bestRating?: string | number;
    };
  }>;
}

/** Pull every JSON-LD <script> blob and pick the Product node(s). */
function extractJsonLdProducts(html: string): JsonLdProduct[] {
  const products: JsonLdProduct[] = [];
  const scriptRe =
    /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let m: RegExpExecArray | null;
  while ((m = scriptRe.exec(html))) {
    const raw = m[1].trim();
    if (!raw) continue;
    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch {
      // Try trimming trailing semicolons / junk
      try {
        parsed = JSON.parse(raw.replace(/[\u0000-\u001F]+/g, " "));
      } catch {
        continue;
      }
    }
    const visit = (node: unknown, depth: number) => {
      if (!node || depth > 6) return;
      if (Array.isArray(node)) {
        node.forEach((c) => visit(c, depth + 1));
        return;
      }
      if (typeof node === "object") {
        const obj = node as Record<string, unknown>;
        const type = obj["@type"];
        const isProduct =
          type === "Product" ||
          (Array.isArray(type) && type.includes("Product")) ||
          Array.isArray(type) && (type as string[]).some((t) => t.includes("Product"));
        if (isProduct) products.push(obj as JsonLdProduct);
        if (typeof obj["@graph"] !== "undefined") visit(obj["@graph"], depth + 1);
        for (const key of ["mainEntity", "itemListElement", "itemReviewed"]) {
          if (typeof obj[key] !== "undefined") visit(obj[key], depth + 1);
        }
      }
    };
    visit(parsed, 0);
  }
  return products;
}

function metaContent(html: string, attr: string, key: string): string | null {
  const re = new RegExp(
    `<meta[^>]+${attr}=["']${key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}["'][^>]*>`,
    "i",
  );
  const tag = html.match(re)?.[0];
  if (!tag) return null;
  const content = tag.match(/content\s*=\s*["']([\s\S]*?)["']/i)?.[1];
  return content ?? null;
}

/** Recursively walk parsed JSON, collect values of given numeric keys. */
function deepNumericValue(node: unknown, keys: string[], depth = 6): number | null {
  if (!node || depth < 0) return null;
  if (Array.isArray(node)) {
    for (const c of node) {
      const v = deepNumericValue(c, keys, depth - 1);
      if (v !== null) return v;
    }
    return null;
  }
  if (typeof node === "object") {
    const obj = node as Record<string, unknown>;
    for (const key of keys) {
      const v = obj[key];
      if (typeof v === "number" && Number.isFinite(v) && v > 0) return v;
      if (typeof v === "string") {
        const p = parsePrice(v);
        if (p !== null) return p;
      }
    }
    for (const k of Object.keys(obj)) {
      const v = deepNumericValue(obj[k], keys, depth - 1);
      if (v !== null) return v;
    }
  }
  return null;
}

/** Like deepNumericValue but constrained to a numeric range. */
function deepBoundedValue(
  node: unknown,
  keys: string[],
  min: number,
  max: number,
  depth = 6,
): number | null {
  if (!node || depth < 0) return null;
  if (Array.isArray(node)) {
    for (const c of node) {
      const v = deepBoundedValue(c, keys, min, max, depth - 1);
      if (v !== null) return v;
    }
    return null;
  }
  if (typeof node === "object") {
    const obj = node as Record<string, unknown>;
    for (const key of keys) {
      const v = obj[key];
      if (typeof v === "number" && Number.isFinite(v) && v >= min && v <= max) return v;
    }
    for (const k of Object.keys(obj)) {
      const v = deepBoundedValue(obj[k], keys, min, max, depth - 1);
      if (v !== null) return v;
    }
  }
  return null;
}

/** Look for explicit out-of-stock flags in store JSON blobs. */
function deepStockSignal(node: unknown, depth = 6): string | undefined {
  if (!node || depth < 0) return undefined;
  if (Array.isArray(node)) {
    for (const c of node) {
      const v = deepStockSignal(c, depth - 1);
      if (v) return v;
    }
    return undefined;
  }
  if (typeof node === "object") {
    const obj = node as Record<string, unknown>;
    for (const key of ["outOfStock", "isOutOfStock", "soldOut"]) {
      if (key in obj && typeof obj[key] === "boolean") {
        return obj[key] ? "Out of Stock" : "In Stock";
      }
    }
    if (obj.availability && typeof obj.availability === "string") {
      return mapAvailability(String(obj.availability));
    }
    for (const v of Object.values(obj)) {
      const found = deepStockSignal(v, depth - 1);
      if (found) return found;
    }
  }
  return undefined;
}

export function mapAvailability(raw: string): string {
  if (/OutOfStock|SoldOut/i.test(raw)) return "Out of Stock";
  if (/LimitedAvailability/i.test(raw)) return "Limited Stock";
  if (/PreOrder/i.test(raw)) return "Pre-Order";
  return "In Stock";
}

/** Recursively find first object with a usable `name` string. */
function deepFindName(node: unknown, depth = 6): string {  if (!node || depth < 0) return "";
  if (Array.isArray(node)) {
    for (const c of node) {
      const v = deepFindName(c, depth - 1);
      if (v) return v;
    }
    return "";
  }
  if (typeof node === "object") {
    const obj = node as Record<string, unknown>;
    if (typeof obj.name === "string" && obj.name.length > 3) {
      return cleanText(obj.name);
    }
    for (const k of Object.keys(obj)) {
      const v = deepFindName(obj[k], depth - 1);
      if (v) return v;
    }
  }
  return "";
}

/** Collect all image-ish strings from parsed JSON. */
function deepCollectImages(node: unknown, out: string[], depth = 6): void {
  if (!node || depth < 0) return;
  if (Array.isArray(node)) {
    node.forEach((c) => deepCollectImages(c, out, depth - 1));
    return;
  }
  if (typeof node === "object") {
    for (const v of Object.values(node as Record<string, unknown>)) {
      if (typeof v === "string") {
        if (/^https?:\/\/.+\.(jpe?g|png|webp)(\?|$)/i.test(v) && !/sprite|icon|logo|placeholder/i.test(v)) {
          out.push(v);
        }
      } else {
        deepCollectImages(v, out, depth - 1);
      }
    }
  }
}

/* ------------------------------------------------------------------ */
/* Fetch with browser-ish headers                                      */
/* ------------------------------------------------------------------ */

const BROWSER_UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36";

export async function fetchHtml(url: string, attempt = 0): Promise<{ html: string; finalUrl: string }> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20000);
  try {
    const res = await fetch(url, {
      redirect: "follow",
      signal: controller.signal,
      headers: {
        "User-Agent": BROWSER_UA,
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
        "Accept-Language": "en-IN,en;q=0.9",
        "Cache-Control": "no-cache",
        Pragma: "no-cache",
        "Upgrade-Insecure-Requests": "1",
      },
    });
    const finalUrl = res.url || url;
    const ct = res.headers.get("content-type") ?? "";
    if (!res.ok) {
      // 503 = the store throttled us — usually transient. Wait a beat and retry.
      if (res.status === 503 && attempt < 2) {
        await new Promise((r) => setTimeout(r, 1500 + attempt * 1500));
        return fetchHtml(url, attempt + 1);
      }
      if (res.status === 404 || res.status === 410) {
        throw new Error(
          "Product page not found (404). The link may be wrong or the product may be discontinued.",
        );
      }
      throw new Error(
        `Page returned status ${res.status}. The site may be blocking automated requests.`,
      );
    }
    if (!ct.includes("html") && !ct.includes("text")) {
      throw new Error("The URL did not return a web page.");
    }
    const html = await res.text();
    // Bot-block detection
    if (
      /Enter the characters you see below|api-services-support@amazon\.com|Incapsula|Just a moment...|Attention Required/i.test(
        html,
      )
    ) {
      throw new Error(
        "The store detected an automated request and showed a captcha/block page. Please fill the details manually or try again in a bit.",
      );
    }
    return { html, finalUrl };
  } finally {
    clearTimeout(timeout);
  }
}

/* ------------------------------------------------------------------ */
/* Per-site extractors                                                 */
/* ------------------------------------------------------------------ */

function extractAmazon(html: string): Partial<ProductDraft> {
  const draft: Partial<ProductDraft> = {};

  // Title — always first choice on Amazon
  const title = html.match(/id=["']productTitle["'][^>]*>([\s\S]*?)<\/[a-z]+/i)?.[1];
  if (title) draft.name = cleanText(title);

  // Review score
  const alt = html.match(/<span[^>]*class=["'][^"']*a-icon-alt[^"']*["'][^>]*>\s*([\d.]+) out of 5/i);
  if (alt) draft.rating = parseFloat(alt[1]);

  const acr = html.match(/acrCustomerReviewText[^>]*>\s*([\d,.]+)\s+ratings/i);
  if (acr) draft.review_count = parseInt(acr[1].replace(/,/g, ""), 10);
  if (!draft.review_count) {
    const genericRc = html.match(/([\d,]{3,})\s+(?:global\s+)?ratings?\b/i);
    if (genericRc) draft.review_count = parseInt(genericRc[1].replace(/,/g, ""), 10);
  }
  const rc = html.match(/["']reviewCount["']\s*:\s*["']?([\d,]+)/);
  if (!draft.review_count && rc) {
    draft.review_count = parseInt(rc[1].replace(/,/, ""), 10);
  }

  // Images — use hi-res gallery first, then "large"
  const images: string[] = [];
  const hiResRe = /"hiRes"\s*:\s*"(https:\/\/m\.media-amazon\.com\/images\/I\/[^"]+\.(?:jpg|png))"/g;
  let im: RegExpExecArray | null;
  while ((im = hiResRe.exec(html))) images.push(im[1]);
  const largeRe = /"large"\s*:\s*"(https:\/\/m\.media-amazon\.com\/images\/I\/[^"]+\.(?:jpg|png))"/g;
  while ((im = largeRe.exec(html))) images.push(im[1]);
  if (images.length) {
    draft.images = uniqueKeepOrder(images).slice(0, 8);
    draft.image_url = draft.images[0];
  }

  // Price — scope to the core price container when possible so we do not
  // accidentally pick a throwaway/last-month price.
  let priceBlob = "";
  const core = html.match(/id=["']corePriceDisplay_desktop_feature_div["'][\s\S]{0,4000}?<\/div>/);
  if (core) priceBlob = core[0];
  else {
    const core2 = html.match(/id=["']corePrice_feature_div["'][\s\S]{0,4000}?<\/div>/);
    if (core2) priceBlob = core2[0];
  }
  const outOfStock = /Currently unavailable|Currently Unavailable/.test(html);

  // Availability — only trust the buy-box region, not stray mentions elsewhere
  // on the page (variants, size selectors, JS templates etc. mention
  // "Currently unavailable" for other options even on in-stock products).
  const buyBox =
    html.match(/id=["']availability["'][\s\S]{0,1200}?\s*<\/div>/i)?.[0] ??
    html.match(/id=["']outOfStock["'][\s\S]{0,1200}?\s*<\/div>/i)?.[0] ??
    html.match(/id=["']desktop_qualifiedBuyBox["'][\s\S]{0,2500}?\s*<\/div>/i)?.[0] ??
    "";
  const buyBoxSaysOut = /Currently unavailable|Out of Stock|Currently Unavailable/i.test(buyBox);
  const anyAddToCart = /addToCart|add-to-cart|Add to Cart|Buy Now/i.test(html);

  let priceRaw: string | null = null;
  const whole = priceBlob
    ? priceBlob.match(/class=["'][^"']*a-price-whole[^"']*["'][^>]*>([\d,]+)\.?(?=\D)/)
    : null;
  const frac = priceBlob
    ? priceBlob.match(/class=["'][^"']*a-price-fraction[^"']*["'][^>]*>(\d+)</)
    : null;
  if (whole) priceRaw = `${whole[1].replace(/,/g, "")}__FRAC__${frac ? frac[1] : "0"}`;
  else if (priceBlob) {
    const off = priceBlob.match(/class=["'][^"']*a-offscreen[^"']*["'][^>]*>([^<]+)</);
    if (off) priceRaw = off[1];
  }
  // If the core price container was absent, the numbers roaming on the page
  // probably belong to other products/carousels — don't trust them.
  if (priceRaw) {
    draft.price = parsePrice(priceRaw.replace("__FRAC__", "."));
  }
  if (outOfStock && !priceBlob) {
    draft.price = null;
  }

  // MRP / list price (basisPrice or a-text-price strikethrough)
  const basis = html.match(
    /class=["'][^"']*a-price a-text-price[^"']*["'][^>]*>\s*<span[^>]*class=["'][^"']*a-offscreen[^"']*["'][^>]*>([^<]+)</,
  );
  const mrpRaw = basis?.[1];
  if (mrpRaw) draft.mrp = parsePrice(mrpRaw);

  // Rating fallback via JSON-LD
  if (!draft.rating) {
    const rv = html.match(/["']ratingValue["']\s*:\s*["']?([\d.]+)/);
    if (rv) draft.rating = parseFloat(rv[1]);
  }
  if (!draft.review_count) {
    const rc2 = html.match(/["']reviewCount["']\s*:\s*["']?([\d,]+)/);
    if (rc2) draft.review_count = parseInt(rc2[1].replace(/,/g, ""), 10);
  }

  // Feature bullets ("About this item") — limit to the first <ul> in the block
  const bulletsBlock = html.match(/id=["']feature-bullets["'][\s\S]*?<\/ul>/i)?.[0];  if (bulletsBlock) {
    const features: string[] = [];
    const liRe = /<span[^>]*class=["'][^"']*a-list-item[^"']*["'][^>]*>([\s\S]*?)<\/span>/gi;
    let li: RegExpExecArray | null;
    while ((li = liRe.exec(bulletsBlock))) {
      const text = cleanText(stripTags(li[1]));
      if (text && text.length > 3 && !/^see more|previous page|report an issue$/i.test(text)) {
        features.push(text);
      }
    }
    if (features.length) draft.features = features.slice(0, 12);
  }

  // Long description fallback
  if (!draft.description) {
    const desc = html.match(
      /<div[^>]*id=["']productDescription["'][^>]*>([\s\S]{0,20000}?)<\/div>/i,
    )?.[1];
    if (desc) draft.description = cleanText(stripTags(desc)).slice(0, 3000);
  }

  // Brand from byline ("Visit the X Store", "Brand: X")
  if (!draft.brand) {
    const byline = html.match(
      /id=["']bylineInfo["'][^>]*>([\s\S]{0,400}?)<\/[a-z]+/,
    )?.[1];
    if (byline) {
      const brandText = cleanText(stripTags(byline));
      draft.brand = cleanText(
        brandText.replace(/^Visit the\s+/i, "").replace(/^Brand\s*:?\s*/i, "").replace(/\s+Store$/i, ""),
      );
    }
  }

  // Availability
  draft.availability =
    buyBoxSaysOut ? "Out of Stock" : priceBlob || anyAddToCart ? "In Stock" : undefined;

  // Top customer reviews shown on the PDP (support old & new Amazon markup)
  // NOTE: the same review id occurs in several nested attributes — group by id.
  const idPos = new Map<string, number>();
  const marker = /customer_review-([A-Z0-9]+)/g;
  let pm: RegExpExecArray | null;
  while ((pm = marker.exec(html))) {
    if (!idPos.has(pm[1])) idPos.set(pm[1], pm.index);
  }
  const positions: number[] = [...idPos.values()];
  const reviewSeen = new Set<string>();
  for (let i = 0; i < positions.length && (draft.reviews?.length ?? 0) < 5; i++) {
    const block = html.slice(positions[i], positions[i + 1] ?? positions[i] + 15000);
    const ratingM = block.match(/(?:a-icon-alt|review-star-rating)[^>]*>\s*([\d.]+)\s+out of 5/);
    const titleM =
      block.match(/data-hook=["']reviewTitle["'][^>]*>([\s\S]{0,300}?)<\/h5>/) ??
      block.match(/review-title[^>]*>[\s\S]*?<span[^>]*>([\s\S]{0,300}?)<\/span>/);
    const authorM = block.match(/a-profile-name(?:["'][^>]*|)>?([^<\s][^<]{0,120})/);
    const dateM = block.match(/review-date["'][^>]*>([\s\S]{0,160}?)<\/span>/);
    // New Amazon markup: text lives between reviewRichContentContainer and
    // reviewExpandButtonContainer / _show_more. Old markup uses review-body.
    let bodyRaw = "";
    const richIdx = block.indexOf("reviewRichContentContainer");
    if (richIdx >= 0) {
      const openEnd = block.indexOf(">", richIdx) + 1; // skip the <div …> open tag
      let cut = block.indexOf("reviewExpandButtonContainer", richIdx);
      const showMore = block.indexOf("show_more", richIdx);
      if (showMore > richIdx && (cut === -1 || showMore < cut)) cut = showMore;
      bodyRaw = block.slice(openEnd, cut > openEnd ? cut : undefined);
    } else {
      const m = block.match(/review-body[^>]*>([\s\S]{0,6000})/);
      if (m) bodyRaw = m[1];
    }
    // strip a11y boilerplate + trailing chrome + leftover escaped tags
    const deA11y = (s: string) =>
      s
        .replace(/<[^>]*>/g, " ")
        .replace(
          /Brief content visible, double tap to read full content\.?\s*(Full content visible, double tap to read brief content\.?)?/gi,
          " ",
        )
        .replace(/\bVerified Purchase\b/gi, " ")
        .replace(/\s*(READ MORE|READ LESS|read more|read less)\s*$/i, "")
        .replace(/\s+/g, " ")
        .trim();
    let body = bodyRaw ? deA11y(cleanText(stripTags(bodyRaw))) : "";
    body = body.split(/\bHelpful\b|\bReport\b/)[0].trim();
    // drop any leftover stray markup fragments
    body = body.split("<div")[0].trim();
    if (body.length > 600) body = body.slice(0, 600);
    if (!body && !titleM) continue;

    const author = authorM ? cleanText(authorM[1]) : "";
    const title = titleM ? cleanText(stripTags(titleM[1])) : "";
    const dedupeKey = `${author}|${title}`;
    if (reviewSeen.has(dedupeKey)) continue;
    reviewSeen.add(dedupeKey);

    if (!draft.reviews) draft.reviews = [];
    draft.reviews.push({
      author,
      rating: ratingM ? parseFloat(ratingM[1]) : null,
      title,
      body,
      date: dateM ? cleanText(stripTags(dateM[1])).replace(/^Reviewed in India on\s+/i, "") : null,
    });
  }

  // Technical spec table (Product Details / Additional Information)
  const specBlock =
    html.match(/id=["']productDetails_techSpec_section_1["'][\s\S]{0,20000}?<\/table>/i)?.[0] ??
    html.match(/id=["']detailBullets_feature_div["'][\s\S]{0,20000}?<\/div>/i)?.[0] ??
    html.match(/id=["']prodDetails["'][\s\S]{0,30000}?<\/table>/i)?.[0];
  if (specBlock) {
    if (!draft.specs) draft.specs = [];
    // Table style: <th>Key</th><td>Value</td>
    const rowRe = /<tr[^>]*>[\s\S]{0,200}?<th[^>]*>([\s\S]{0,300}?)<\/th>[\s\S]{0,200}?<td[^>]*>([\s\S]{0,600}?)<\/td>/gi;
    let rm: RegExpExecArray | null;
    while ((rm = rowRe.exec(specBlock)) && draft.specs.length < 25) {
      const key = cleanText(stripTags(rm[1]));
      const value = cleanText(stripTags(rm[2]));
      if (key && value) draft.specs.push({ key, value });
    }
    // Bullet style: <span class="a-text-bold">Key : </span> Value
    if (draft.specs.length === 0) {
      const bulletRe = /<span[^>]*class=["'][^"']*a-text-bold[^"']*["'][^>]*>([\s\S]{0,300}?)<\/span>\s*:?\s*<\/span>\s*([\s\S]{0,300}?)(?=<li|<\/span>|<\/div>)/gi;
      let bm: RegExpExecArray | null;
      while ((bm = bulletRe.exec(specBlock)) && draft.specs.length < 25) {
        const key = cleanText(stripTags(bm[1]));
        const value = cleanText(stripTags(bm[2]));
        if (key && value && key.length < 60) draft.specs.push({ key, value });
      }
    }
  }

  return draft;
}

function extractFlipkart(html: string): Partial<ProductDraft> {
  const draft: Partial<ProductDraft> = {};

  // NOTE: name and images are handled via JSON-LD in extractGeneric — it
  // carries Flipkart's hi-res (1280px) images and exact product title.

  // Highlights — Flipkart ships them as a JSON array of HTML strings.
  const hl = html.match(/"highlights"\s*:\s*\[([\s\S]{0,6000}?)\]/);
  if (hl) {
    try {
      const arr = JSON.parse(`[${hl[1]}]`) as string[];
      const features = arr.map((s) => cleanText(stripTags(String(s)))).filter((s) => s.length > 2);
      if (features.length) draft.features = features.slice(0, 12);
    } catch {
      /* ignore */
    }
  }
  if (!draft.features?.length) {
    const blockRe = /<div[^>]*class=["'][^"']*(?:Xbd6S4|_1m Zuk|col col-4-12 _3rr9gb)[^"']*["'][^>]*>([\s\S]{0,800}?)<\/div>/gi;
    const found: string[] = [];
    let mm: RegExpExecArray | null;
    while ((mm = blockRe.exec(html)) && found.length < 12) {
      const t = cleanText(stripTags(mm[1]));
      if (t && t.length < 120) found.push(t);
    }
    if (found.length > 2) draft.features = found;
  }

  // Price — itemprop price meta, then JSON blob keys
  const itempProp = metaContent(html, "itemprop", "price");
  const content = itempProp ?? metaContent(html, "property", "product:price:amount");
  if (content) draft.price = parsePrice(content);
  if (!draft.price) {
    const blob = html.match(/"price"\s*:\s*"?([\d.,]+)"?/);
    if (blob) draft.price = parsePrice(blob[1]);
  }

  // MRP — look for strikethrough-ish JSON or the mrp key
  const mrpKeys = ["mrp", "listPrice", "originalPrice"];
  for (const k of mrpKeys) {
    const m = html.match(new RegExp(`"${k}"\\s*:\\s*"?([\\d.,]+)"?`, "i"));
    if (m) {
      const v = parsePrice(m[1]);
      // Ignore "mrp: 0"-style junk
      if (v && (!draft.price || v > draft.price)) {
        draft.mrp = v;
        break;
      }
    }
  }

  // Images are delegated to extractGeneric (JSON-LD hi-res first, og fallback)

  // Rating via aggregateRating JSON-LD (generic operator pe bhi fallback meta)
  const rat = html.match(/"aggregateRating"\s*:\s*\{[^}]*"ratingValue"\s*:\s*"?([\d.]+)/);
  if (rat) draft.rating = parseFloat(rat[1]);
  const rc = html.match(/"ratingCount"\s*:\s*"?([\d,]+)/);
  if (rc) draft.review_count = parseInt(rc[1].replace(/,/g, ""), 10);

  // Description from og:description (often a text blob of specs)
  const ogd = metaContent(html, "property", "og:description");
  const desc = metaContent(html, "name", "description");
  const descText = cleanText(ogd || desc || "");
  if (descText && !/^\d+\s*(ratings|reviews)/i.test(descText)) {
    draft.description = descText.slice(0, 3000);
  }

  return draft;
}

function extractMyntra(html: string): Partial<ProductDraft> {
  const draft: Partial<ProductDraft> = {};

  // window.__myx = {…};
  const idx = html.search(/window\.__myx\s*=/);
  if (idx >= 0) {
    const braceStart = html.indexOf("{", idx);
    if (braceStart > -1) {
      const jsonBlob = extractBalancedObject(html, braceStart);
      if (jsonBlob) {
        try {
          const data = JSON.parse(jsonBlob) as unknown;
          const picked = deepFindName(data);
          if (picked) draft.name = picked;
          const price = deepNumericValue(data, [
            "discountedPrice",
            "currentPrice",
            "price",
          ]);
          if (price) draft.price = price;
          const mrp = deepNumericValue(data, ["mrp", "listPrice", "originalPrice", "price"]);
          if (mrp && (!draft.price || mrp > draft.price)) draft.mrp = mrp;

          // rating / ratingCount from __myx (values constrained to sanity range)
          const ratingRaw = deepBoundedValue(data, ["rating", "ratingValue"], 1, 5);
          if (ratingRaw !== null) draft.rating = ratingRaw;
          const rcRaw = deepBoundedValue(data, ["ratingCount", "reviewCount"], 1, 1_000_000);
          if (rcRaw !== null) draft.review_count = Math.round(rcRaw);
          const stock = deepStockSignal(data);
          if (stock) draft.availability = stock;

          const images: string[] = [];
          deepCollectImages(data, images);
          const filtered = uniqueKeepOrder(images).filter((u) =>
            /myntassets\.com/.test(u),
          );
          if (filtered.length) {
            draft.images = filtered.slice(0, 10);
            draft.image_url = draft.images[0];
          }
        } catch {
          /* ignore */
        }
      }
    }
  }

  // OG fallbacks — Myntra always has usable og:title/og:image
  const ogTitle = metaContent(html, "property", "og:title");
  if (!draft.name && ogTitle) draft.name = cleanText(ogTitle);
  if (!draft.image_url) {
    const ogImage = metaContent(html, "property", "og:image");
    if (ogImage) {
      draft.images = [absoluteUrl(html, ogImage)];
      draft.image_url = draft.images[0];
    }
  }

  // Myntra brands the name as "Brand Something — Product name" in OG title
  const dash = draft.name?.split(/\s+[-–—|]\s+/);
  if (dash && dash.length >= 2) {
    draft.brand = cleanText(dash[0]);
    draft.name = cleanText(dash.slice(1).join(" - "));
  }

  // Specs — look for the dl/dt of specification section (best effort)
  const specBlock = html.match(/<div[^>]*class=["'][^"']*index-tableContainer[^"']*["'][\s\S]{0,4000}?<\/table>/i);
  if (specBlock?.[0]) {
    const rows: string[] = [];
    const rowRe = /<td[^>]*>([\s\S]*?)<\/td>\s*<td[^>]*>([\s\S]*?)<\/td>/gi;
    let r: RegExpExecArray | null;
    while ((r = rowRe.exec(specBlock[0])) && rows.length < 10) {
      const key = cleanText(stripTags(r[1]));
      const val = cleanText(stripTags(r[2]));
      if (key && val) rows.push(`${key}: ${val}`);
    }
    if (rows.length) draft.features = rows;
  }

  // Description from og / meta description
  const ogd = metaContent(html, "property", "og:description");
  const metad = metaContent(html, "name", "description");
  const descText = cleanText(ogd || metad || "");
  if (descText) draft.description = descText.slice(0, 3000);

  // Fallback price from og/description texts ("...at Rs. 3299", "₹ 3999")
  if (draft.price == null) {
    const atRs = (descText || "").match(/(?:at|just)\s+Rs\.?\s*([\d,]{3,})/i);
    const priceInDesc = atRs ?? (descText || "").match(/(?:Rs\.?\s*|₹\s*)([\d,]{3,})/i);
    if (priceInDesc) draft.price = parsePrice(priceInDesc[1]);
  }

  return draft;
}

/** Generic JSON-LD / Open Graph extraction, works with almost any store. */
function extractGeneric(html: string): Partial<ProductDraft> {
  const draft: Partial<ProductDraft> = {};
  const products = extractJsonLdProducts(html);
  if (products.length) {
    const p = products[0];
    if (p.name) draft.name = cleanText(typeof p.name === "string" ? p.name : "");
    if (p.description) draft.description = cleanText(stripTags(p.description)).slice(0, 3000);
    if (p.brand) {
      if (typeof p.brand === "string") draft.brand = cleanText(p.brand);
      else if (Array.isArray(p.brand)) {
        const first = p.brand[0] as string | { name?: string } | undefined;
        draft.brand = cleanText(
          typeof first === "string" ? (first ?? "") : (first?.name ?? ""),
        );
      }
      else if (typeof p.brand === "object") draft.brand = cleanText(p.brand.name ?? "");
    }
    const offers = Array.isArray(p.offers) ? p.offers[0] : p.offers;
    if (offers?.price != null) draft.price = parsePrice(String(offers.price));
    if (offers?.priceCurrency) draft.currency = offers.priceCurrency;
    if (offers?.availability) draft.availability = mapAvailability(String(offers.availability));
    if (typeof p.image === "string") draft.images = [absoluteUrl(html, p.image)];
    else if (Array.isArray(p.image)) {
      draft.images = uniqueKeepOrder(p.image.map((u) => absoluteUrl(html, u))).filter(Boolean);
    }
    if (p.aggregateRating?.ratingValue) draft.rating = parseFloat(String(p.aggregateRating.ratingValue));
    if (p.aggregateRating?.reviewCount) {
      draft.review_count = parseInt(String(p.aggregateRating.reviewCount).replace(/,/g, ""), 10);
    } else if (p.aggregateRating?.ratingCount) {
      draft.review_count = parseInt(String(p.aggregateRating.ratingCount).replace(/,/g, ""), 10);
    }

    // Customer reviews embedded in JSON-LD (Flipkart sometimes ships these)
    if (Array.isArray(p.review) && p.review.length > 0) {
      const reviewList = p.review.slice(0, 5).map((rv) => {
        const authorRaw = rv.author;
        const author =
          typeof authorRaw === "string" ? authorRaw : (authorRaw?.name ?? "");
        const rr = rv.reviewRating;
        const ratingVal = rr?.ratingValue != null ? parseFloat(String(rr.ratingValue)) : null;
        // Some stores rate on 10; normalize when bestRating says so
        const best = rr?.bestRating != null ? parseFloat(String(rr.bestRating)) : 5;
        const normalized =
          ratingVal != null && best >= 5 && ratingVal > best ? ratingVal / (best / 5) : ratingVal;
        return {
          author: cleanText(author ?? ""),
          rating: Number.isFinite(normalized as number) ? normalized : null,
          title: "",
          body: cleanText(rv.reviewBody ?? "").slice(0, 800),
          date: rv.datePublished ?? null,
        };
      });
      if (reviewList.some((r) => r.body)) draft.reviews = reviewList;
    }
    if (draft.images?.length) draft.image_url = draft.images[0];
  }

  // OG meta fallbacks for anything JSON-LD missed
  if (!draft.name) draft.name = cleanText(metaContent(html, "property", "og:title") ?? "");
  if (!draft.description) {
    draft.description = cleanText(
      metaContent(html, "property", "og:description") ??
        metaContent(html, "name", "description") ??
        "",
    ).slice(0, 3000);
  }
  if (!draft.image_url) {
    const ogImage = metaContent(html, "property", "og:image");
    if (ogImage) {
      draft.images = [absoluteUrl(html, ogImage)];
      draft.image_url = draft.images[0];
    }
  }
  // Flipkart/Myntra serve small og images like /300/300/ — request hi-res
  if (draft.images?.length) {
    draft.images = draft.images.map((u) =>
      u.replace(/(rukminim\d*\.flixcart\.com\/image|assets\.myntassets\.com\/h_\d+,w_\d+)\/\d+\/\d+\//, "$1/1280/1280/"),
    );
    draft.image_url = draft.images[0];
  }
  if (!draft.price) {
    const priceMeta =
      metaContent(html, "property", "product:price:amount") ??
      metaContent(html, "itemprop", "price");
    if (priceMeta) draft.price = parsePrice(priceMeta);
  }
  if (draft.currency === undefined || draft.currency === "") {
    const cur =
      metaContent(html, "property", "product:price:currency") ??
      metaContent(html, "itemprop", "priceCurrency");
    if (cur) draft.currency = cur.trim().toUpperCase();
  }
  return draft;
}

/* ------------------------------------------------------------------ */
/* Main entry                                                          */
/* ------------------------------------------------------------------ */

/** Strip boilerplate suffixes sites append to titles. */
function cleanProductName(name: string | undefined): string {
  if (!name) return "";
  return (
    cleanText(name)
      // "X - Buy Y Online at Best Prices in India | Flipkart.com"
      .replace(/\s*-\s*Buy[\s\S]*$/i, "")
      // "X, Price in India", "X Price in India"
      .replace(/[,|]?\s*Price in India[\s\S]*$/i, "")
      // "X - Amazon.in", "X | Amazon.in"
      .replace(/\s*[-|]\s*Amazon\.[a-z.]+\s*$/i, "")
      // "X | Flipkart.com" / "X - Flipkart"
      .replace(/\s*[-|]\s*Flipkart(\.com)?\s*$/i, "")
      // "X - Jeans for Men <id> | Myntra"
      .replace(/\s*[-|]\s*Myntra\.?\s*$/i, "")
      .trim()
  );
}

function detectSite(host: string): string {
  if (/amazon\./i.test(host)) return "amazon";
  if (/flipkart\./i.test(host) || /^fkrt\.art$/i.test(host)) return "flipkart";
  if (/myntra\./i.test(host)) return "myntra";
  return "generic";
}

/* ------------------------------------------------------------------ */
/* Category detection                                                  */
/* ------------------------------------------------------------------ */

/** Pull category-path hints out of parsed JSON (BreadcrumbList etc.). */
function deepCollectBreadcrumbs(node: unknown, out: string[], depth = 6): void {
  if (!node || depth < 0) return;
  if (Array.isArray(node)) {
    node.forEach((c) => deepCollectBreadcrumbs(c, out, depth - 1));
    return;
  }
  if (typeof node === "object") {
    const obj = node as Record<string, unknown>;
    if (obj["@type"] === "BreadcrumbList" && Array.isArray(obj.itemListElement)) {
      for (const el of obj.itemListElement as Array<Record<string, unknown>>) {
        const item = el?.item;
        const nm =
          typeof el?.name === "string" && (el.name as string).trim()
            ? (el.name as string)
            : typeof item === "object" &&
                item &&
                typeof (item as Record<string, unknown>).name === "string"
              ? ((item as Record<string, unknown>).name as string)
              : "";
        if (nm.trim()) out.push(cleanText(nm));
      }
    }
    if (typeof obj.category === "string" && obj.category.trim()) {
      out.push(cleanText(obj.category));
    }
    for (const v of Object.values(obj)) deepCollectBreadcrumbs(v, out, depth - 1);
  }
}

/** Parse every ld+json script and mine breadcrumbs from the parsed blobs. */
function jsonLdBreadcrumbs(html: string): string[] {
  const out: string[] = [];
  const scriptRe =
    /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let m: RegExpExecArray | null;
  while ((m = scriptRe.exec(html))) {
    try {
      deepCollectBreadcrumbs(JSON.parse(m[1].trim()), out);
    } catch {
      /* ignore malformed blobs */
    }
  }
  return out;
}

/** Amazon wayfinding crumbs ("Electronics › Headphones › …"). */
function amazonBreadcrumbs(html: string): string[] {
  const crumbs: string[] = [];
  const block = html.match(
    /id=["']wayfinding-breadcrumbs_feature_div["'][\s\S]{0,4000}?<\/div>/i,
  )?.[0];
  if (block) {
    const aRe = /<a[^>]*>([\s\S]*?)<\/a>/gi;
    let m: RegExpExecArray | null;
    while ((m = aRe.exec(block))) {
      const t = cleanText(stripTags(m[1]));
      if (t) crumbs.push(t);
    }
  }
  if (crumbs.length) return crumbs;
  // Fallback: "See Top 100 in Electronics" from Best Sellers Rank
  const rank = html.match(/See Top \d+ in ([A-Za-z][A-Za-z &']{2,40})/);
  return rank ? [cleanText(rank[1])] : [];
}

/** Myntra __myx breadcrumb-ish data. */
function myntraBreadcrumbs(html: string): string[] {
  const idx = html.search(/window\.__myx\s*=/);
  if (idx < 0) return [];
  const brace = html.indexOf("{", idx);
  const blob = brace > -1 ? extractBalancedObject(html, brace) : null;
  if (!blob) return [];
  const out: string[] = [];
  try {
    const walk = (n: unknown, d: number): void => {
      if (!n || d < 0 || out.length > 12) return;
      if (Array.isArray(n)) {
        n.forEach((c) => walk(c, d - 1));
        return;
      }
      if (typeof n !== "object") return;
      const o = n as Record<string, unknown>;
      for (const key of ["breadcrumb", "breadcrumbs", "categoryPath", "categories"]) {
        if (Array.isArray(o[key])) {
          for (const el of o[key] as unknown[]) {
            if (typeof el === "string" && el.trim()) out.push(cleanText(el));
            else if (el && typeof el === "object") {
              const e = el as Record<string, unknown>;
              const nm = e.label ?? e.value ?? e.name;
              if (typeof nm === "string" && nm.trim()) out.push(cleanText(nm));
            }
          }
        }
      }
      for (const v of Object.values(o)) walk(v, d - 1);
    };
    walk(JSON.parse(blob), 5);
  } catch {
    /* ignore */
  }
  return uniqueKeepOrder(out);
}

/** Keyword map onto Urban Deals categories. */
const CATEGORY_PATTERNS: Array<{ slug: string; re: RegExp }> = [
  { slug: "watches", re: /watch|chronograph|analog|wearable|wrist/i },
  {
    slug: "electronics",
    re: /electronics?|headphone|earbud|airpod|speaker|laptop|mobile|smartphone|tablet|charger|power\s?bank|keyboard|mouse|monitor|camera|television|smart\s?tv|audio|soundbar|trimmer|console|drone|gadget|computer/i,
  },
  {
    slug: "kitchen",
    re: /kitchen|mixer|blender|cookware|kettle|cooker|knife|dinnerware|cutlery|tiffin|fryer|induction|utensil|juicer|chopper|coffee\s?maker/i,
  },
  {
    slug: "home",
    re: /home|cushion|curtain|bedsheet|bed\s?sheet|pillow|mattress|lamp|decor|furniture|sofa|vase|planter|storage|furnishing/i,
  },
  {
    slug: "cosmetic",
    re: /beauty|cosmetic|cream|serum|lipstick|shampoo|conditioner|skin\s?care|skincare|perfume|fragrance|deodorant|makeup|lotion|soap|sunscreen|kajal|eyeliner/i,
  },
  {
    slug: "fashion",
    re: /fashion|clothing|apparel|shirt|jeans|trouser|kurti|kurta|saree|dress|jacket|hoodie|sweater|shoes|sneaker|sandal|footwear|bag|backpack|wallet|belt|handbag|ethnic/i,
  },
];

const CRUMB_NOISE = /^(home|amazon\.?[a-z.]*|flipkart(\.com)?|myntra|offers?|all categories)$/i;

/**
 * Guess the Urban Deals category from store breadcrumbs + product name.
 * Breadcrumbs weigh far more than the name; the deepest (last) crumb is the
 * most specific and gets the highest weight.
 */
export function guessCategory(
  crumbs: string[],
  name: string,
): { slug: string; matched: string } {
  const haystacks: Array<{ text: string; w: number }> = [];
  const kept: string[] = [];
  for (const c of crumbs) {
    const t = c.trim();
    if (!t || t.length > 48 || CRUMB_NOISE.test(t)) continue;
    if (name && t.length > 6 && name.toLowerCase().includes(t.toLowerCase())) continue;
    kept.push(t);
  }
  kept.forEach((t, i) => haystacks.push({ text: t, w: 10 + 2 * i }));
  if (name) haystacks.push({ text: name, w: 1 });

  const scores = new Map<string, number>();
  let matched = "";
  let bestWeight = 0;
  for (const h of haystacks) {
    for (const { slug, re } of CATEGORY_PATTERNS) {
      const m = h.text.match(re);
      if (!m) continue;
      scores.set(slug, (scores.get(slug) ?? 0) + h.w);
      if (h.w > bestWeight) {
        bestWeight = h.w;
        matched = h.text === name ? `${m[0]} (name)` : h.text;
      }
    }
  }
  let slug = "";
  let best = 0;
  scores.forEach((v, k) => {
    if (v > best) {
      best = v;
      slug = k;
    }
  });
  return { slug, matched: slug ? matched : "" };
}

export async function fetchProductDraft(rawUrl: string): Promise<ProductDraft> {
  const { html, finalUrl } = await fetchHtml(rawUrl);
  let host = "";
  try {
    host = new URL(finalUrl).hostname;
  } catch {
    host = new URL(rawUrl).hostname;
  }
  const site = detectSite(host);

  let partial: Partial<ProductDraft> = {};
  if (site === "amazon") partial = extractAmazon(html);
  else if (site === "flipkart") partial = extractFlipkart(html);
  else if (site === "myntra") partial = extractMyntra(html);

  const generic = extractGeneric(html);
  // Merge: site-specific wins, generic fills gaps.
  const merged: Partial<ProductDraft> = {
    ...generic,
    ...partial,
    // keep union of images so we have fallbacks
    images: dedupeImagesSimilar([...(partial.images ?? []), ...(generic.images ?? [])]),
  };
  if (!merged.image_url && merged.images?.length) merged.image_url = merged.images[0];
  merged.image_url = merged.image_url ? normalizeImage(merged.image_url) : "";

  const currency = merged.currency || detectCurrency(html, site);
  const discount =
    merged.price != null && merged.mrp != null && merged.mrp > merged.price
      ? Math.round(((merged.mrp - merged.price) / merged.mrp) * 100)
      : null;

  // Site-specific product identifiers
  let sku = "";
  try {
    const u = new URL(finalUrl);
    const asin = u.pathname.match(/\/(?:dp|ASIN)\/([A-Z0-9]{10})/);
    const pid = u.pathname.match(/\/p\/([A-Z0-9]+)/i) ?? u.searchParams.get("pid");
    const myntraId = u.pathname.match(/\/(\d{6,})\/buy/);
    sku = asin?.[1] ?? (typeof pid === "string" ? pid : myntraId?.[1] ?? "");
  } catch {
    /* ignore */
  }

  // Category hints — store breadcrumbs + keyword guess
  const crumbs = uniqueKeepOrder([
    ...(site === "amazon" ? amazonBreadcrumbs(html) : []),
    ...(site === "myntra" ? myntraBreadcrumbs(html) : []),
    ...jsonLdBreadcrumbs(html),
  ]);
  const name = cleanProductName(merged.name);
  const guessed = guessCategory(crumbs, name);

  return {
    name,
    description: merged.description ?? "",
    price: merged.price ?? null,
    mrp: merged.mrp ?? null,
    discount_percent: discount,
    currency,
    brand: merged.brand ?? "",
    sku,
    availability: merged.availability ?? "",
    rating: merged.rating ?? null,
    review_count: merged.review_count ?? null,
    image_url: merged.image_url ?? "",
    images: merged.images ?? [],
    features: merged.features ?? [],
    specs: merged.specs ?? [],
    reviews: merged.reviews ?? [],
    source: site,
    canonical_url: finalUrl,
    category: guessed.slug,
    breadcrumbs: crumbs,
  };
}
