-- ============================================================
-- Update 3: per-product homepage section placement
-- Run this in the Supabase SQL Editor (Dashboard → SQL)
-- ============================================================

-- Which homepage sections a product appears in
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS home_sections text[] NOT NULL DEFAULT '{}';

-- (Optional) seed: products rated 4.0+ go to the Trending section
-- UPDATE public.products
-- SET home_sections = array_append(home_sections, 'trending')
-- WHERE rating >= 4.0
--   AND NOT ('trending' = ANY(home_sections));
