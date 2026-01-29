-- Insert default admin user (email: admin@example.com, password: admin123)
-- NOTE: In production, use bcrypt or similar for password hashing
-- The password hash below is just base64 encoded for demonstration

INSERT INTO admin_users (email, password_hash) 
VALUES ('admin@example.com', 'YWRtaW4xMjM=')
ON CONFLICT (email) DO NOTHING;

-- Add some sample products for demonstration
INSERT INTO products (name, description, category, affiliate_link, image_url) VALUES
(
  'Premium Wireless Headphones',
  'High-quality wireless headphones with noise cancellation and 30-hour battery life',
  'electronics',
  'https://amazon.com/s?k=wireless+headphones',
  'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&q=80'
),
(
  '4K Smart TV 55-inch',
  '55-inch 4K Smart TV with HDR support and smart apps integration',
  'electronics',
  'https://amazon.com/s?k=4k+smart+tv',
  'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=400&q=80'
),
(
  'Coffee Maker Pro',
  'Programmable coffee maker with thermal carafe and brew strength control',
  'kitchen',
  'https://amazon.com/s?k=coffee+maker',
  'https://images.unsplash.com/photo-1517668808822-9ebb02ae2a0e?w=400&q=80'
)
ON CONFLICT DO NOTHING;

-- Add values for sample products
INSERT INTO product_values (product_id, value_text) 
SELECT id, value_text FROM (
  SELECT id, 'Active Noise Cancellation' as value_text FROM products WHERE name = 'Premium Wireless Headphones'
  UNION ALL
  SELECT id, '30-hour battery life' as value_text FROM products WHERE name = 'Premium Wireless Headphones'
  UNION ALL
  SELECT id, 'Comfortable over-ear design' as value_text FROM products WHERE name = 'Premium Wireless Headphones'
) temp
ON CONFLICT DO NOTHING;
