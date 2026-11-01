-- ============================================================
-- Fix: admin (anon) writes were silently blocked by RLS.
-- UPDATE requests returned 200 but changed 0 rows, so homepage
-- section toggles never persisted.
--
-- Run this ONCE in Supabase Dashboard → SQL Editor → Run.
-- ============================================================

-- products: allow anyone to write (this is a single-admin site)
alter table products enable row level security;

drop policy if exists "public read products" on products;
create policy "public read products"
  on products for select using (true);

drop policy if exists "public insert products" on products;
create policy "public insert products"
  on products for insert with check (true);

drop policy if exists "public update products" on products;
create policy "public update products"
  on products for update using (true) with check (true);

drop policy if exists "public delete products" on products;
create policy "public delete products"
  on products for delete using (true);

-- product_values (key features)
alter table product_values enable row level security;

drop policy if exists "public read product_values" on product_values;
create policy "public read product_values"
  on product_values for select using (true);

drop policy if exists "public insert product_values" on product_values;
create policy "public insert product_values"
  on product_values for insert with check (true);

drop policy if exists "public update product_values" on product_values;
create policy "public update product_values"
  on product_values for update using (true) with check (true);

drop policy if exists "public delete product_values" on product_values;
create policy "public delete product_values"
  on product_values for delete using (true);

-- categories
alter table categories enable row level security;

drop policy if exists "public read categories" on categories;
create policy "public read categories"
  on categories for select using (true);

drop policy if exists "public insert categories" on categories;
create policy "public insert categories"
  on categories for insert with check (true);

drop policy if exists "public update categories" on categories;
create policy "public update categories"
  on categories for update using (true) with check (true);

drop policy if exists "public delete categories" on categories;
create policy "public delete categories"
  on categories for delete using (true);

-- reviews
alter table reviews enable row level security;

drop policy if exists "public read reviews" on reviews;
create policy "public read reviews"
  on reviews for select using (true);

-- done. Admin toggle writes will now persist.
