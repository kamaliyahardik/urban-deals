-- ============================================================
-- Update 5: admin-controlled product ordering
--
-- Adds a manual ordering column so the admin can decide which
-- products appear first on /products (and everywhere else).
--
-- Run this ONCE in Supabase Dashboard → SQL Editor → Run.
-- ============================================================

-- 1. Manual order column. Lower number = higher on the page.
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS display_order integer;

-- 2. Seed existing products: newest product gets the SMALLEST
--    number so the current visual order (recently added first)
--    is preserved exactly.
WITH ranked AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY created_at DESC) AS rn
  FROM public.products
)
UPDATE public.products p
SET display_order = ranked.rn
FROM ranked
WHERE p.id = ranked.id
  AND p.display_order IS NULL;

-- 3. Safety net: any product inserted without an explicit order
--    (e.g. raw SQL) goes to the very bottom of the list.
ALTER TABLE public.products
  ALTER COLUMN display_order SET DEFAULT 2147483647;

-- Done. New products added from the admin panel automatically
-- get the next number (bottom of the list) — the admin can then
-- move them up/down from the dashboard.
