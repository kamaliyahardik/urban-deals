export const PROD_URL = "https://urbandeals.hardikkamaliya.online";

/**
 * Returns the canonical site URL.
 * - Uses NEXT_PUBLIC_SITE_URL when set to a real (non-vercel.app) domain.
 * - Falls back to the production domain.
 */
export function getSiteUrl(): string {
  const cleaned = (process.env.NEXT_PUBLIC_SITE_URL || "")
    .trim()
    .replace(/\/+$/, "");
  if (cleaned && !/\.vercel\.app/i.test(cleaned)) return cleaned;
  return PROD_URL;
}
