/**
 * JAMII HARDWARE - DATABASE SCHEMA
 * PostgreSQL Schema with complete data structure
 * Tables: Users, Products, Orders, Inventory, Payments, Analytics
 */

-- ============ ENABLE EXTENSIONS ============
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ============ USERS TABLE ============
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  address TEXT,
  city VARCHAR(100),
  county VARCHAR(100),
  postal_code VARCHAR(10),
  role VARCHAR(50) DEFAULT 'customer', -- customer, contractor, manager, owner
  user_type VARCHAR(50) DEFAULT 'retail', -- retail, wholesale
  is_active BOOLEAN DEFAULT true,
  last_login TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_created_at ON users(created_at DESC);

-- ============ CATEGORIES TABLE ============
CREATE TABLE IF NOT EXISTS categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  icon VARCHAR(255),
  parent_id INT REFERENCES categories(id),
  is_active BOOLEAN DEFAULT true,
  display_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_categories_slug ON categories(slug);
CREATE INDEX idx_categories_active ON categories(is_active);

-- ============ PRODUCTS TABLE ============
CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  sku VARCHAR(100) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE,
  description TEXT,
  detailed_description TEXT,
  category_id INT REFERENCES categories(id),
  category VARCHAR(100),
  price_kes DECIMAL(10, 2) NOT NULL,
  wholesale_price_kes DECIMAL(10, 2),
  contractor_price_kes DECIMAL(10, 2),
  cost_price_kes DECIMAL(10, 2),
  stock_quantity INT DEFAULT 0,
  min_stock_level INT DEFAULT 10,
  reorder_quantity INT DEFAULT 50,
  image_url VARCHAR(500),
  images_json JSON,
  specifications JSON,
  warranty_months INT DEFAULT 0,
  rating DECIMAL(3, 2) DEFAULT 0,
  review_count INT DEFAULT 0,
  is_featured BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_products_sku ON products(sku);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_active ON products(is_active);
CREATE INDEX idx_products_featured ON products(is_featured);
CREATE INDEX idx_products_created_at ON products(created_at DESC);
CREATE INDEX idx_products_name ON products USING GIN(to_tsvector('english', name));

-- ============ PRODUCT REVIEWS TABLE ============
CREATE TABLE IF NOT EXISTS product_reviews (
  id SERIAL PRIMARY KEY,
  product_id INT REFERENCES products(id) ON DELETE CASCADE,
  user_id INT REFERENCES users(id),
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title VARCHAR(255),
  comment TEXT,
  helpful_count INT DEFAULT 0,
  is_verified_purchase BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_reviews_product ON product_reviews(product_id);
CREATE INDEX idx_reviews_user ON product_reviews(user_id);
CREATE INDEX idx_reviews_rating ON product_reviews(rating DESC);

-- ============ ORDERS TABLE ============
CREATE TABLE IF NOT EXISTS orders (
  id SERIAL PRIMARY KEY,
  order_number VARCHAR(50) UNIQUE NOT NULL,
  user_id INT REFERENCES users(id),
  order_type VARCHAR(50) DEFAULT 'retail', -- retail, wholesale, contractor
  subtotal_kes DECIMAL(12, 2),
  delivery_fee_kes DECIMAL(10, 2) DEFAULT 0,
  discount_kes DECIMAL(10, 2) DEFAULT 0,
  tax_kes DECIMAL(10, 2) DEFAULT 0,
  total_kes DECIMAL(12, 2),
  payment_method VARCHAR(50), -- mpesa, airtel, card, pay_on_delivery
  payment_status VARCHAR(50) DEFAULT 'pending', -- pending, paid, failed, refunded
  payment_reference VARCHAR(255),
  order_status VARCHAR(50) DEFAULT 'pending', -- pending, confirmed, processing, shipped, delivered, cancelled
  
  delivery_type VARCHAR(50) DEFAULT 'delivery', -- delivery, pickup
  delivery_address TEXT,
  delivery_county VARCHAR(100),
  delivery_city VARCHAR(100),
  delivery_date DATE,
  estimated_delivery_date DATE,
  actual_delivery_date DATE,
  
  notes TEXT,
  admin_notes TEXT,
  is_bulk_order BOOLEAN DEFAULT false,
  requires_signature BOOLEAN DEFAULT false,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_orders_number ON orders(order_number);
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(order_status);
CREATE INDEX idx_orders_payment_status ON orders(payment_status);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);

-- ============ ORDER ITEMS TABLE ============
CREATE TABLE IF NOT EXISTS order_items (
  id SERIAL PRIMARY KEY,
  order_id INT REFERENCES orders(id) ON DELETE CASCADE,
  product_id INT REFERENCES products(id),
  product_name VARCHAR(255),
  product_sku VARCHAR(100),
  quantity INT NOT NULL,
  unit_price_kes DECIMAL(10, 2),
  total_kes DECIMAL(12, 2),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_order_items_product ON order_items(product_id);

-- ============ INVENTORY LOG TABLE ============
CREATE TABLE IF NOT EXISTS inventory_logs (
  id SERIAL PRIMARY KEY,
  product_id INT REFERENCES products(id),
  old_quantity INT,
  new_quantity INT,
  change_quantity INT,
  change_reason VARCHAR(100), -- sale, restock, adjustment, return, damage
  order_id INT,
  reference_number VARCHAR(100),
  created_by INT REFERENCES users(id),
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_inventory_product ON inventory_logs(product_id);
CREATE INDEX idx_inventory_reason ON inventory_logs(change_reason);
CREATE INDEX idx_inventory_date ON inventory_logs(created_at DESC);

-- ============ PROMO CODES TABLE ============
CREATE TABLE IF NOT EXISTS promo_codes (
  id SERIAL PRIMARY KEY,
  code VARCHAR(50) UNIQUE NOT NULL,
  description TEXT,
  discount_type VARCHAR(50), -- percentage, fixed
  discount_value DECIMAL(10, 2),
  max_discount_kes DECIMAL(10, 2),
  min_order_amount_kes DECIMAL(10, 2),
  usage_limit INT,
  usage_count INT DEFAULT 0,
  per_user_limit INT DEFAULT 1,
  applicable_categories VARCHAR(500),
  valid_from DATE,
  valid_until DATE,
  is_active BOOLEAN DEFAULT true,
  created_by INT REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_promo_code ON promo_codes(code);
CREATE INDEX idx_promo_active ON promo_codes(is_active);

-- ============ PAYMENTS TABLE ============
CREATE TABLE IF NOT EXISTS payments (
  id SERIAL PRIMARY KEY,
  order_id INT REFERENCES orders(id),
  payment_method VARCHAR(50), -- mpesa, airtel, card, bank
  payment_gateway VARCHAR(100), -- safaricom, airtel, stripe, custom
  amount_kes DECIMAL(12, 2),
  transaction_id VARCHAR(255) UNIQUE,
  merchant_request_id VARCHAR(255),
  checkout_request_id VARCHAR(255),
  response_code VARCHAR(10),
  response_message TEXT,
  result_code VARCHAR(10),
  result_description TEXT,
  
  mpesa_receipt_number VARCHAR(50),
  mpesa_transaction_date TIMESTAMP,
  
  card_token VARCHAR(255),
  card_last_four VARCHAR(4),
  
  payment_status VARCHAR(50), -- pending, completed, failed, refunded
  refund_amount_kes DECIMAL(12, 2),
  refund_reason TEXT,
  refund_date TIMESTAMP,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_payments_order ON payments(order_id);
CREATE INDEX idx_payments_transaction ON payments(transaction_id);
CREATE INDEX idx_payments_status ON payments(payment_status);

-- ============ DELIVERY MANAGEMENT TABLE ============
CREATE TABLE IF NOT EXISTS deliveries (
  id SERIAL PRIMARY KEY,
  order_id INT REFERENCES orders(id),
  delivery_partner VARCHAR(100),
  tracking_number VARCHAR(100),
  delivery_status VARCHAR(50), -- pending, in_transit, delivered, failed
  
  pickup_time TIMESTAMP,
  estimated_delivery TIMESTAMP,
  actual_delivery TIMESTAMP,
  
  delivery_address TEXT,
  delivery_county VARCHAR(100),
  delivery_fee_kes DECIMAL(10, 2),
  
  recipient_name VARCHAR(255),
  recipient_phone VARCHAR(20),
  signature_url VARCHAR(500),
  notes TEXT,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_delivery_order ON deliveries(order_id);
CREATE INDEX idx_delivery_status ON deliveries(delivery_status);
CREATE INDEX idx_delivery_tracking ON deliveries(tracking_number);

-- ============ WISHLIST TABLE ============
CREATE TABLE IF NOT EXISTS wishlist (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  product_id INT REFERENCES products(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

CREATE INDEX idx_wishlist_user ON wishlist(user_id);

-- ============ CART TABLE ============
CREATE TABLE IF NOT EXISTS carts (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id),
  session_id VARCHAR(255),
  product_id INT REFERENCES products(id),
  quantity INT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_cart_user ON carts(user_id);
CREATE INDEX idx_cart_session ON carts(session_id);

-- ============ BULK ORDER QUOTES TABLE ============
CREATE TABLE IF NOT EXISTS bulk_quotes (
  id SERIAL PRIMARY KEY,
  quote_number VARCHAR(50) UNIQUE NOT NULL,
  user_id INT REFERENCES users(id),
  company_name VARCHAR(255),
  contact_person VARCHAR(255),
  contact_phone VARCHAR(20),
  contact_email VARCHAR(255),
  
  items_json JSON,
  subtotal_kes DECIMAL(12, 2),
  estimated_discount_kes DECIMAL(10, 2),
  estimated_total_kes DECIMAL(12, 2),
  
  delivery_county VARCHAR(100),
  special_requirements TEXT,
  
  status VARCHAR(50) DEFAULT 'pending', -- pending, quoted, accepted, rejected, expired
  quoted_price_kes DECIMAL(12, 2),
  quote_validity_days INT DEFAULT 7,
  valid_until DATE,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_bulk_quotes_number ON bulk_quotes(quote_number);
CREATE INDEX idx_bulk_quotes_user ON bulk_quotes(user_id);

-- ============ ANALYTICS TABLE ============
CREATE TABLE IF NOT EXISTS analytics_events (
  id BIGSERIAL PRIMARY KEY,
  event_type VARCHAR(100), -- page_view, product_view, add_to_cart, checkout, purchase
  user_id INT REFERENCES users(id),
  product_id INT REFERENCES products(id),
  order_id INT REFERENCES orders(id),
  session_id VARCHAR(255),
  ip_address VARCHAR(45),
  user_agent TEXT,
  event_data JSON,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_analytics_type ON analytics_events(event_type);
CREATE INDEX idx_analytics_user ON analytics_events(user_id);
CREATE INDEX idx_analytics_date ON analytics_events(created_at DESC);

-- ============ DAILY SALES SUMMARY TABLE ============
CREATE TABLE IF NOT EXISTS daily_sales_summary (
  id SERIAL PRIMARY KEY,
  sale_date DATE UNIQUE,
  total_orders INT,
  total_revenue_kes DECIMAL(12, 2),
  total_discount_kes DECIMAL(12, 2),
  average_order_value_kes DECIMAL(12, 2),
  total_items_sold INT,
  top_category VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_daily_sales_date ON daily_sales_summary(sale_date);

-- ============ SETTINGS TABLE ============
CREATE TABLE IF NOT EXISTS settings (
  id SERIAL PRIMARY KEY,
  key VARCHAR(255) UNIQUE NOT NULL,
  value TEXT,
  setting_type VARCHAR(50), -- string, integer, boolean, json
  description TEXT,
  updated_at TIMESTAMP DEFAULT NOW()
);

INSERT INTO settings (key, value, setting_type) VALUES
  ('store_name', 'Jamii Hardware', 'string'),
  ('store_phone', '+254712345678', 'string'),
  ('store_email', 'info@jamiihardware.com', 'string'),
  ('store_address', 'Bulbul, Kenya - Opposite Rubis Petrol Station', 'string'),
  ('business_hours', '{"monday": "8:00-18:00", "tuesday": "8:00-18:00"}', 'json'),
  ('default_delivery_fee', '500', 'integer'),
  ('tax_rate', '16', 'integer')
ON CONFLICT (key) DO NOTHING;

-- ============ AUDIT LOG TABLE ============
CREATE TABLE IF NOT EXISTS audit_logs (
  id BIGSERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id),
  action VARCHAR(255),
  table_name VARCHAR(100),
  record_id INT,
  old_data JSON,
  new_data JSON,
  ip_address VARCHAR(45),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_audit_user ON audit_logs(user_id);
CREATE INDEX idx_audit_table ON audit_logs(table_name);
CREATE INDEX idx_audit_date ON audit_logs(created_at DESC);

-- ============ TRIGGER: Update product updated_at ============
CREATE OR REPLACE FUNCTION update_product_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_product_updated
BEFORE UPDATE ON products
FOR EACH ROW
EXECUTE FUNCTION update_product_timestamp();

-- ============ TRIGGER: Update order updated_at ============
CREATE OR REPLACE FUNCTION update_order_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_order_updated
BEFORE UPDATE ON orders
FOR EACH ROW
EXECUTE FUNCTION update_order_timestamp();

-- ============ TRIGGER: Log inventory changes ============
CREATE OR REPLACE FUNCTION log_inventory_change()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.stock_quantity != OLD.stock_quantity THEN
    INSERT INTO inventory_logs (
      product_id, old_quantity, new_quantity, change_quantity, change_reason, created_by
    ) VALUES (
      NEW.id, OLD.stock_quantity, NEW.stock_quantity,
      NEW.stock_quantity - OLD.stock_quantity,
      'manual_adjustment', 1
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_inventory_log
AFTER UPDATE ON products
FOR EACH ROW
WHEN (OLD.stock_quantity IS DISTINCT FROM NEW.stock_quantity)
EXECUTE FUNCTION log_inventory_change();

-- ============ VIEW: Sales Summary ============
CREATE OR REPLACE VIEW v_sales_summary AS
SELECT
  DATE(orders.created_at) as sale_date,
  COUNT(DISTINCT orders.id) as total_orders,
  SUM(orders.total_kes) as total_revenue_kes,
  SUM(orders.discount_kes) as total_discount_kes,
  AVG(orders.total_kes) as avg_order_value,
  COUNT(order_items.id) as total_items
FROM orders
LEFT JOIN order_items ON orders.id = order_items.order_id
WHERE orders.payment_status = 'paid'
GROUP BY DATE(orders.created_at)
ORDER BY sale_date DESC;

-- ============ VIEW: Product Performance ============
CREATE OR REPLACE VIEW v_product_performance AS
SELECT
  products.id,
  products.sku,
  products.name,
  products.category,
  COUNT(order_items.id) as units_sold,
  SUM(order_items.quantity) as total_quantity,
  SUM(order_items.total_kes) as total_revenue_kes,
  AVG(products.rating) as avg_rating
FROM products
LEFT JOIN order_items ON products.id = order_items.product_id
LEFT JOIN orders ON order_items.order_id = orders.id
WHERE orders.payment_status = 'paid' OR orders.id IS NULL
GROUP BY products.id, products.sku, products.name, products.category
ORDER BY total_revenue_kes DESC;

-- ============ VIEW: Customer Lifetime Value ============
CREATE OR REPLACE VIEW v_customer_ltv AS
SELECT
  users.id,
  users.email,
  users.full_name,
  COUNT(DISTINCT orders.id) as total_orders,
  SUM(orders.total_kes) as lifetime_value_kes,
  MAX(orders.created_at) as last_order_date,
  AVG(orders.total_kes) as avg_order_value
FROM users
LEFT JOIN orders ON users.id = orders.user_id
WHERE orders.payment_status = 'paid' OR orders.id IS NULL
GROUP BY users.id, users.email, users.full_name
ORDER BY lifetime_value_kes DESC;

-- ============ SEED DATA ============
INSERT INTO categories (name, slug, description, icon, display_order) VALUES
  ('Cement', 'cement', 'Portland Cement, Concrete', '🏗️', 1),
  ('Steel', 'steel', 'Reinforced Steel, Rods', '⚙️', 2),
  ('Paint', 'paint', 'Paints, Varnish, Coatings', '🎨', 3),
  ('Plumbing', 'plumbing', 'Pipes, Fittings, Fixtures', '🚰', 4),
  ('Electrical', 'electrical', 'Wiring, Cables, Switches', '⚡', 5),
  ('Roofing', 'roofing', 'Roofing Materials, Gutters', '🏠', 6),
  ('Tiles', 'tiles', 'Floor Tiles, Wall Tiles', '🧱', 7),
  ('Tools', 'tools', 'Hand Tools, Power Tools', '🔨', 8),
  ('Water Tanks', 'water-tanks', 'Storage Tanks, Drums', '💧', 9),
  ('Safety Equipment', 'safety', 'Helmets, Gloves, PPE', '🦺', 10);

INSERT INTO products (
  sku, name, category, price_kes, stock_quantity, description, is_featured
) VALUES
  ('JH-CEMENT-001', 'Portland Cement 50kg', 'Cement', 450, 150, 'High quality Portland cement for construction', true),
  ('JH-PAINT-001', 'Premium Emulsion Paint 20L', 'Paint', 3500, 45, 'Professional grade interior/exterior paint', true),
  ('JH-PIPE-001', 'PVC Pipe 50mm x 3m', 'Plumbing', 850, 200, 'Durable PVC piping for water systems', true),
  ('JH-STEEL-001', '12mm Reinforced Steel Rod', 'Steel', 12000, 80, 'High tensile strength steel reinforcement', true),
  ('JH-TILE-001', 'Ceramic Floor Tile 600x600', 'Tiles', 2200, 350, 'Premium quality ceramic tiles', true);

-- ============ GRANT PERMISSIONS ============
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO jamii;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO jamii;
