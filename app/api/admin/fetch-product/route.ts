import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { fetchProductDraft } from "@/lib/product-fetcher";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Verifies the admin JWT issued by /api/admin/login.
 * Shape: base64(header).base64(payload).base64(hmac-sha256)
 */
function verifyAdminToken(token: string | null): boolean {
  if (!token) return false;
  const parts = token.split(".");
  if (parts.length !== 3) return false;
  const [header, body, signature] = parts;
  const secret = process.env.ADMIN_JWT_SECRET || "your-secret-key";
  const expected = crypto
    .createHmac("sha256", secret)
    .update(`${header}.${body}`)
    .digest("base64");
  if (signature !== expected) return false;
  try {
    const payload = JSON.parse(
      Buffer.from(body, "base64").toString("utf8"),
    ) as { exp?: number };
    if (!payload.exp || payload.exp < Math.floor(Date.now() / 1000)) return false;
    return true;
  } catch {
    return false;
  }
}

/** Only allow shared e-commerce hosts — blocks SSRF / open-proxy abuse. */
function isAllowedHost(hostname: string): boolean {
  const host = hostname.toLowerCase();
  const patterns = [
    /^(www\.|m\.|dl\.)?amazon\.[a-z.]+$/,
    /^(www\.|m\.|dl\.)?flipkart\.[a-z.]+$/,
    /^fkrt\.art$/,
    /^(www\.)?myntra\.[a-z.]+$/,
  ];
  return patterns.some((p) => p.test(host));
}

export async function POST(request: NextRequest) {
  // Auth — must match the admin session token saved by the login page.
  const authHeader = request.headers.get("authorization") ?? "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!verifyAdminToken(token)) {
    return NextResponse.json(
      { message: "Session expired. Please log in again." },
      { status: 401 },
    );
  }

  let url: string;
  try {
    const body = (await request.json()) as { url?: unknown };
    if (typeof body.url !== "string") {
      return NextResponse.json({ message: "url is required" }, { status: 400 });
    }
    url = body.url.trim();
  } catch {
    return NextResponse.json({ message: "Invalid request body" }, { status: 400 });
  }

  if (!url) {
    return NextResponse.json({ message: "Please paste a product URL first." }, { status: 400 });
  }
  if (!/^https?:\/\//i.test(url)) {
    url = `https://${url}`;
  }
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return NextResponse.json({ message: "That does not look like a valid URL." }, { status: 400 });
  }
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    return NextResponse.json(
      { message: "Only http/https URLs are allowed." },
      { status: 400 },
    );
  }
  const hostname = parsed.hostname.toLowerCase();
  const isLocalhost =
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname === "0.0.0.0" ||
    hostname === "::1" ||
    hostname.endsWith(".local") ||
    hostname.endsWith(".internal") ||
    /^10\./.test(hostname) ||
    /^192\.168\./.test(hostname) ||
    /^172\.(1[6-9]|2\d|3[01])\./.test(hostname) ||
    /^169\.254\./.test(hostname);
  if (isLocalhost) {
    return NextResponse.json(
      { message: "Internal addresses are not allowed." },
      { status: 400 },
    );
  }
  if (!isAllowedHost(hostname)) {
    return NextResponse.json(
      {
        message:
          "Only Amazon, Flipkart and Myntra product links are supported right now.",
      },
      { status: 400 },
    );
  }

  try {
    const draft = await fetchProductDraft(parsed.toString());
    if (!draft.name && draft.price == null) {
      return NextResponse.json(
        {
          message:
            "Could not read product info from that page. Please fill the details manually.",
        },
        { status: 422 },
      );
    }
    return NextResponse.json({ draft });
  } catch (err) {
    const message =
      (err as Error)?.message ?? "Failed to fetch the product page.";
    return NextResponse.json({ message }, { status: 502 });
  }
}
