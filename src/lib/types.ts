export interface Product {
  id: string;
  created_at: string;
  updated_at: string;
  slug: string;
  name: string;
  name_en: string;
  description: string | null;
  description_en: string | null;
  category: string;
  price: number;
  compare_at_price: number | null;
  cost_price: number | null;
  sku: string | null;
  stock: number;
  weight_grams: number | null;
  badge: string | null;
  featured: boolean;
  available: boolean;
  image_urls: string[];
  variant_color: string | null;
  metadata: ProductMetadata;
}

export interface ProductMetadata {
  sugar_free?: boolean;
  ingredients?: string[];
  weight?: string;
  benefits?: string[];
}

export interface ProductVariant {
  id: string;
  product_id: string;
  name: string;
  price: number;
  compare_at_price: number | null;
  sku: string | null;
  stock: number;
  weight_grams: number | null;
  sort_order: number;
  available: boolean;
}

export interface Customer {
  id: string;
  created_at: string;
  updated_at: string;
  auth_user_id: string | null;
  name: string;
  email: string | null;
  phone: string | null;
  address_line1: string | null;
  address_line2: string | null;
  city: string | null;
  postcode: string | null;
  state: string | null;
  country: string;
  notes: string | null;
  tags: string[];
  metadata: Record<string, unknown>;
}

export interface CustomerSummary extends Customer {
  order_count: number;
  lifetime_value: number;
  avg_order_value: number;
  last_order_at: string | null;
  first_order_at: string | null;
}

export type OrderStatus =
  | "pending_payment"
  | "paid"
  | "confirmed"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "refunded";

export interface Order {
  id: string;
  created_at: string;
  updated_at: string;
  order_number: string;
  customer_id: string | null;
  customer_name: string;
  customer_email: string | null;
  customer_phone: string;
  shipping_address_line1: string;
  shipping_address_line2: string | null;
  shipping_city: string;
  shipping_postcode: string;
  shipping_state: string;
  subtotal: number;
  shipping_fee: number;
  discount_amount: number;
  total: number;
  payment_method: string | null;
  payment_status: string;
  payment_ref: string | null;
  paid_at: string | null;
  status: OrderStatus;
  tracking_number: string | null;
  shipped_at: string | null;
  delivered_at: string | null;
  notes: string | null;
  discount_code: string | null;
  source: string;
  metadata: Record<string, unknown>;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  variant_id: string | null;
  product_name: string;
  variant_name: string | null;
  price: number;
  quantity: number;
  line_total: number;
}

export interface CartItem {
  product_id: string;
  variant_id: string | null;
  quantity: number;
  product?: Product;
  variant?: ProductVariant;
}

export interface DiscountCode {
  id: string;
  created_at: string;
  code: string;
  description: string | null;
  type: "percentage" | "fixed";
  value: number;
  min_order: number;
  max_uses: number | null;
  times_used: number;
  starts_at: string | null;
  expires_at: string | null;
  active: boolean;
}

export interface Campaign {
  id: string;
  created_at: string;
  name: string;
  channel: "email" | "whatsapp" | "sms";
  subject: string | null;
  body: string | null;
  status: "draft" | "scheduled" | "sent" | "cancelled";
  scheduled_at: string | null;
  sent_at: string | null;
  recipient_count: number;
  segment_filter: Record<string, unknown>;
}

export interface DailySnapshot {
  date: string;
  total_orders: number;
  total_revenue: number;
  avg_order_value: number;
  new_customers: number;
  page_views: number;
}

export const MALAYSIAN_STATES = [
  "Johor",
  "Kedah",
  "Kelantan",
  "Kuala Lumpur",
  "Labuan",
  "Melaka",
  "Negeri Sembilan",
  "Pahang",
  "Penang",
  "Perak",
  "Perlis",
  "Putrajaya",
  "Sabah",
  "Sarawak",
  "Selangor",
  "Terengganu",
] as const;

export type MalaysianState = (typeof MALAYSIAN_STATES)[number];

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending_payment: "Pending Payment",
  paid: "Paid",
  confirmed: "Confirmed",
  processing: "Processing",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
  refunded: "Refunded",
};
