-- ============================================================================
-- AMRITA E-Commerce + CRM Schema
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ---------------------------------------------------------------------------
-- Products
-- ---------------------------------------------------------------------------
CREATE TABLE products (
    id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at      timestamptz NOT NULL DEFAULT now(),
    updated_at      timestamptz NOT NULL DEFAULT now(),
    slug            text        NOT NULL UNIQUE,
    name            text        NOT NULL,
    name_en         text        NOT NULL,
    description     text,
    description_en  text,
    category        text        NOT NULL DEFAULT 'candy',
    price           decimal(10,2) NOT NULL,
    compare_at_price decimal(10,2),
    cost_price      decimal(10,2),
    sku             text        UNIQUE,
    stock           integer     NOT NULL DEFAULT -1,
    weight_grams    integer,
    badge           text,
    featured        boolean     NOT NULL DEFAULT false,
    available       boolean     NOT NULL DEFAULT true,
    image_urls      text[]      DEFAULT '{}',
    variant_color   text,
    metadata        jsonb       DEFAULT '{}'
);

-- ---------------------------------------------------------------------------
-- Product Variants
-- ---------------------------------------------------------------------------
CREATE TABLE product_variants (
    id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id      uuid        NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    name            text        NOT NULL,
    price           decimal(10,2) NOT NULL,
    compare_at_price decimal(10,2),
    sku             text        UNIQUE,
    stock           integer     NOT NULL DEFAULT -1,
    weight_grams    integer,
    sort_order      integer     NOT NULL DEFAULT 0,
    available       boolean     NOT NULL DEFAULT true
);

-- ---------------------------------------------------------------------------
-- Customers
-- ---------------------------------------------------------------------------
CREATE TABLE customers (
    id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at      timestamptz NOT NULL DEFAULT now(),
    updated_at      timestamptz NOT NULL DEFAULT now(),
    auth_user_id    uuid        UNIQUE,
    name            text        NOT NULL,
    email           text,
    phone           text,
    address_line1   text,
    address_line2   text,
    city            text,
    postcode        text,
    state           text,
    country         text        DEFAULT 'Malaysia',
    notes           text,
    tags            text[]      DEFAULT '{}',
    metadata        jsonb       DEFAULT '{}'
);

CREATE INDEX idx_customers_email ON customers(email);
CREATE INDEX idx_customers_phone ON customers(phone);
CREATE INDEX idx_customers_auth_user ON customers(auth_user_id);
CREATE INDEX idx_customers_name_trgm ON customers USING GIN (name gin_trgm_ops);

-- ---------------------------------------------------------------------------
-- Orders
-- ---------------------------------------------------------------------------
CREATE TYPE order_status AS ENUM (
    'pending_payment', 'paid', 'confirmed', 'processing',
    'shipped', 'delivered', 'cancelled', 'refunded'
);

CREATE TABLE orders (
    id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at      timestamptz NOT NULL DEFAULT now(),
    updated_at      timestamptz NOT NULL DEFAULT now(),
    order_number    text        UNIQUE NOT NULL,
    customer_id     uuid        REFERENCES customers(id),
    customer_name   text        NOT NULL,
    customer_email  text,
    customer_phone  text        NOT NULL,
    shipping_address_line1 text NOT NULL,
    shipping_address_line2 text,
    shipping_city   text        NOT NULL,
    shipping_postcode text      NOT NULL,
    shipping_state  text        NOT NULL,
    subtotal        decimal(10,2) NOT NULL,
    shipping_fee    decimal(10,2) NOT NULL DEFAULT 0,
    discount_amount decimal(10,2) NOT NULL DEFAULT 0,
    total           decimal(10,2) NOT NULL,
    payment_method  text,
    payment_status  text        NOT NULL DEFAULT 'pending',
    payment_ref     text,
    paid_at         timestamptz,
    status          order_status NOT NULL DEFAULT 'pending_payment',
    tracking_number text,
    shipped_at      timestamptz,
    delivered_at    timestamptz,
    notes           text,
    discount_code   text,
    source          text        DEFAULT 'web',
    metadata        jsonb       DEFAULT '{}'
);

CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_customer ON orders(customer_id);
CREATE INDEX idx_orders_created ON orders(created_at);
CREATE INDEX idx_orders_number ON orders(order_number);

-- ---------------------------------------------------------------------------
-- Order Items
-- ---------------------------------------------------------------------------
CREATE TABLE order_items (
    id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id        uuid        NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id      uuid        NOT NULL REFERENCES products(id),
    variant_id      uuid        REFERENCES product_variants(id),
    product_name    text        NOT NULL,
    variant_name    text,
    price           decimal(10,2) NOT NULL,
    quantity        integer     NOT NULL,
    line_total      decimal(10,2) NOT NULL
);

CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_order_items_product ON order_items(product_id);

-- ---------------------------------------------------------------------------
-- Discount Codes
-- ---------------------------------------------------------------------------
CREATE TABLE discount_codes (
    id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at      timestamptz NOT NULL DEFAULT now(),
    code            text        UNIQUE NOT NULL,
    description     text,
    type            text        NOT NULL CHECK (type IN ('percentage', 'fixed')),
    value           decimal(10,2) NOT NULL,
    min_order       decimal(10,2) DEFAULT 0,
    max_uses        integer,
    times_used      integer     NOT NULL DEFAULT 0,
    starts_at       timestamptz,
    expires_at      timestamptz,
    active          boolean     NOT NULL DEFAULT true
);

-- ---------------------------------------------------------------------------
-- Carts (logged-in users)
-- ---------------------------------------------------------------------------
CREATE TABLE carts (
    id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id     uuid        NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    updated_at      timestamptz NOT NULL DEFAULT now(),
    items           jsonb       NOT NULL DEFAULT '[]'
);

CREATE UNIQUE INDEX idx_carts_customer ON carts(customer_id);

-- ---------------------------------------------------------------------------
-- Daily Snapshots
-- ---------------------------------------------------------------------------
CREATE TABLE daily_snapshots (
    date            date        PRIMARY KEY,
    total_orders    integer     NOT NULL DEFAULT 0,
    total_revenue   decimal(10,2) NOT NULL DEFAULT 0,
    avg_order_value decimal(10,2) NOT NULL DEFAULT 0,
    new_customers   integer     NOT NULL DEFAULT 0,
    page_views      integer     DEFAULT 0,
    updated_at      timestamptz NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- Campaigns
-- ---------------------------------------------------------------------------
CREATE TABLE campaigns (
    id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at      timestamptz NOT NULL DEFAULT now(),
    name            text        NOT NULL,
    channel         text        NOT NULL CHECK (channel IN ('email', 'whatsapp', 'sms')),
    subject         text,
    body            text,
    status          text        NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'sent', 'cancelled')),
    scheduled_at    timestamptz,
    sent_at         timestamptz,
    recipient_count integer     DEFAULT 0,
    segment_filter  jsonb       DEFAULT '{}'
);

-- ---------------------------------------------------------------------------
-- Activity Log
-- ---------------------------------------------------------------------------
CREATE TABLE activity_log (
    id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at      timestamptz NOT NULL DEFAULT now(),
    entity_type     text        NOT NULL,
    entity_id       uuid        NOT NULL,
    action          text        NOT NULL,
    details         jsonb       DEFAULT '{}',
    actor_id        uuid
);

CREATE INDEX idx_activity_entity ON activity_log(entity_type, entity_id);

-- ---------------------------------------------------------------------------
-- Triggers
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_customers_updated_at BEFORE UPDATE ON customers FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ---------------------------------------------------------------------------
-- Views
-- ---------------------------------------------------------------------------
CREATE VIEW customer_summary AS
SELECT
    c.id, c.name, c.email, c.phone, c.state, c.tags,
    c.created_at, c.updated_at,
    COALESCE(COUNT(o.id), 0)::integer AS order_count,
    COALESCE(SUM(o.total), 0) AS lifetime_value,
    COALESCE(AVG(o.total), 0) AS avg_order_value,
    MAX(o.created_at) AS last_order_at,
    MIN(o.created_at) AS first_order_at
FROM customers c
LEFT JOIN orders o ON o.customer_id = c.id AND o.status NOT IN ('cancelled', 'refunded')
GROUP BY c.id;

CREATE VIEW monthly_revenue AS
SELECT
    date_trunc('month', o.created_at)::date AS month,
    COUNT(o.id)::integer AS order_count,
    COALESCE(SUM(o.total), 0) AS total_revenue,
    COALESCE(AVG(o.total), 0) AS avg_order_value,
    COUNT(DISTINCT o.customer_id)::integer AS unique_customers
FROM orders o
WHERE o.status NOT IN ('cancelled', 'refunded')
GROUP BY date_trunc('month', o.created_at)
ORDER BY month DESC;

-- ---------------------------------------------------------------------------
-- RLS Policies
-- ---------------------------------------------------------------------------
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE discount_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;

-- Products: public read
CREATE POLICY "Anyone can read products" ON products FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admin can manage products" ON products FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Anyone can read variants" ON product_variants FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admin can manage variants" ON product_variants FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Orders: public can create, authenticated can manage
CREATE POLICY "Anyone can create orders" ON orders FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Read orders" ON orders FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admin manages orders" ON orders FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Anyone can create order items" ON order_items FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Read order items" ON order_items FOR SELECT TO anon, authenticated USING (true);

-- Customers
CREATE POLICY "Admin manages customers" ON customers FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Insert customers" ON customers FOR INSERT TO anon WITH CHECK (true);

-- Admin-only tables
CREATE POLICY "Admin access snapshots" ON daily_snapshots FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin access campaigns" ON campaigns FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin access activity log" ON activity_log FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin access discount codes" ON discount_codes FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Carts
CREATE POLICY "Users manage own cart" ON carts FOR ALL TO authenticated
    USING (customer_id IN (SELECT id FROM customers WHERE auth_user_id = auth.uid()));
