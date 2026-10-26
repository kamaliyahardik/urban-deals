-- ============================================================
-- Phase 2: Extended product data (auto-fetched A-to-Z fields)
-- Run this in Supabase SQL Editor once.
-- ============================================================

-- Pricing extras
ALTER TABLE products ADD COLUMN IF NOT EXISTS mrp NUMERIC;
ALTER TABLE products ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'INR';
ALTER TABLE products ADD COLUMN IF NOT EXISTS discount_percent NUMERIC;

-- Identity / marketplace info
ALTER TABLE products ADD COLUMN IF NOT EXISTS brand TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS sku TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS source TEXT;

-- Ratings & stock
ALTER TABLE products ADD COLUMN IF NOT EXISTS rating NUMERIC;
ALTER TABLE products ADD COLUMN IF NOT EXISTS review_count INTEGER;
ALTER TABLE products ADD COLUMN IF NOT EXISTS availability TEXT;

-- Rich structured data (arrays / objects stored as JSON)
ALTER TABLE products ADD COLUMN IF NOT EXISTS images JSONB DEFAULT '[]'::jsonb;
ALTER TABLE products ADD COLUMN IF NOT EXISTS specs JSONB DEFAULT '[]'::jsonb;
ALTER TABLE products ADD COLUMN IF NOT EXISTS reviews JSONB DEFAULT '[]'::jsonb;

-- Give existing rows sensible defaults for currency
UPDATE products SET currency = 'INR' WHERE currency IS NULL;

-- Backfill discount for existing rows (where possible)
UPDATE products
SET discount_percent = ROUND(((mrp - price) / mrp) * 100)
WHERE mrp IS NOT NULL AND mrp > price AND discount_percent IS NULL;
