import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getShippingFee } from "@/lib/shipping";
import { checkRates, getAccessToken } from "@/lib/easyparcel";
import type { MalaysianState } from "@/lib/types";
import { sendConversionEvent } from "@/lib/meta-capi";

interface CheckoutItem {
  product_id: string;
  variant_id: string | null;
  quantity: number;
}

interface UTMData {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
}

interface CheckoutBody {
  customer: {
    name: string;
    email?: string;
    phone: string;
    address_line1: string;
    address_line2?: string;
    city: string;
    postcode: string;
    state: string;
  };
  items: CheckoutItem[];
  payment_method: string;
  notes?: string;
  utm?: UTMData;
  shipping_service_id?: string;
  shipping_courier?: string;
}

function generateOrderNumber(): string {
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, "");
  const rand = String(Math.floor(Math.random() * 1000)).padStart(3, "0");
  return `AM-${dateStr}-${rand}`;
}

export async function POST(request: Request) {
  try {
    const body: CheckoutBody = await request.json();
    const { customer, items, payment_method, notes, utm, shipping_service_id, shipping_courier } = body;

    if (!customer?.name || !customer?.phone || !customer?.address_line1 || !customer?.city || !customer?.postcode || !customer?.state) {
      return NextResponse.json({ error: "Missing required customer fields" }, { status: 400 });
    }

    if (!items || items.length === 0) {
      return NextResponse.json({ error: "No items in order" }, { status: 400 });
    }

    const supabase = await createClient();

    // Look up real prices from Supabase
    const productIds = [...new Set(items.map((i) => i.product_id))];
    const variantIds = items.map((i) => i.variant_id).filter((id): id is string => id !== null);

    const { data: products, error: productsError } = await supabase
      .from("products")
      .select("*")
      .in("id", productIds);

    if (productsError || !products) {
      return NextResponse.json({ error: "Failed to look up products" }, { status: 500 });
    }

    let variants: { id: string; product_id: string; name: string; price: number }[] = [];
    if (variantIds.length > 0) {
      const { data: variantData, error: variantsError } = await supabase
        .from("product_variants")
        .select("*")
        .in("id", variantIds);

      if (variantsError) {
        return NextResponse.json({ error: "Failed to look up variants" }, { status: 500 });
      }
      variants = variantData || [];
    }

    // Build order items with real prices
    const orderItems: {
      product_id: string;
      variant_id: string | null;
      product_name: string;
      variant_name: string | null;
      price: number;
      quantity: number;
      line_total: number;
    }[] = [];

    for (const item of items) {
      const product = products.find((p) => p.id === item.product_id);
      if (!product) {
        return NextResponse.json({ error: `Product not found: ${item.product_id}` }, { status: 400 });
      }

      let price = product.price;
      let variantName: string | null = null;

      if (item.variant_id) {
        const variant = variants.find((v) => v.id === item.variant_id);
        if (!variant) {
          return NextResponse.json({ error: `Variant not found: ${item.variant_id}` }, { status: 400 });
        }
        price = variant.price;
        variantName = variant.name;
      }

      orderItems.push({
        product_id: item.product_id,
        variant_id: item.variant_id,
        product_name: product.name_en || product.name,
        variant_name: variantName,
        price,
        quantity: item.quantity,
        line_total: price * item.quantity,
      });
    }

    const subtotal = orderItems.reduce((sum, i) => sum + i.line_total, 0);

    // If a specific EasyParcel service was selected, look up the real rate
    let shippingFee = getShippingFee(customer.state as MalaysianState, subtotal);
    if (shipping_service_id && shippingFee > 0) {
      const accessToken = await getAccessToken();
      if (accessToken) {
        const rates = await checkRates(accessToken, "50000", customer.postcode, customer.state, 0.3);
        const matched = rates.find((r) => r.service_id === shipping_service_id);
        if (matched) {
          shippingFee = matched.price;
        }
      }
    }

    const total = subtotal + shippingFee;
    const orderNumber = generateOrderNumber();

    // Find or create customer by phone
    let customerId: string | null = null;
    const { data: existingCustomer } = await supabase
      .from("customers")
      .select("id")
      .eq("phone", customer.phone)
      .single();

    // Check if there's a logged-in user to link the customer record
    let authUserId: string | null = null;
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (authUser) {
      authUserId = authUser.id;
    }

    if (existingCustomer) {
      customerId = existingCustomer.id;
      // Update customer info, and link auth_user_id if logged in
      const updateData: Record<string, unknown> = {
        name: customer.name,
        email: customer.email || null,
        address_line1: customer.address_line1,
        address_line2: customer.address_line2 || null,
        city: customer.city,
        postcode: customer.postcode,
        state: customer.state,
      };
      if (authUserId) {
        updateData.auth_user_id = authUserId;
      }
      await supabase
        .from("customers")
        .update(updateData)
        .eq("id", customerId);
    } else {
      const { data: newCustomer, error: customerError } = await supabase
        .from("customers")
        .insert({
          name: customer.name,
          email: customer.email || null,
          phone: customer.phone,
          address_line1: customer.address_line1,
          address_line2: customer.address_line2 || null,
          city: customer.city,
          postcode: customer.postcode,
          state: customer.state,
          country: "MY",
          tags: [],
          metadata: {},
          ...(authUserId ? { auth_user_id: authUserId } : {}),
        })
        .select("id")
        .single();

      if (customerError || !newCustomer) {
        return NextResponse.json({ error: "Failed to create customer" }, { status: 500 });
      }
      customerId = newCustomer.id;
    }

    // Create order
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        order_number: orderNumber,
        customer_id: customerId,
        customer_name: customer.name,
        customer_email: customer.email || null,
        customer_phone: customer.phone,
        shipping_address_line1: customer.address_line1,
        shipping_address_line2: customer.address_line2 || null,
        shipping_city: customer.city,
        shipping_postcode: customer.postcode,
        shipping_state: customer.state,
        subtotal,
        shipping_fee: shippingFee,
        discount_amount: 0,
        total,
        payment_method: payment_method || null,
        payment_status: "pending",
        status: "pending_payment",
        notes: notes || null,
        source: utm?.utm_source || "storefront",
        metadata: {
          ...(utm ? { utm } : {}),
          ...(shipping_service_id ? { shipping_service_id } : {}),
          ...(shipping_courier ? { shipping_courier } : {}),
        },
      })
      .select("id, order_number")
      .single();

    if (orderError || !order) {
      return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
    }

    // Insert order items
    const { error: itemsError } = await supabase
      .from("order_items")
      .insert(
        orderItems.map((item) => ({
          order_id: order.id,
          ...item,
        }))
      );

    if (itemsError) {
      return NextResponse.json({ error: "Failed to create order items" }, { status: 500 });
    }

    // Fire Meta Conversions API event (non-blocking)
    sendConversionEvent("Purchase", {
      value: total,
      currency: "MYR",
      orderId: order.order_number,
      email: customer.email,
      phone: customer.phone,
      contents: orderItems.map((item) => ({
        id: item.product_id,
        quantity: item.quantity,
      })),
    }).catch(() => {
      // Silently ignore CAPI errors — don't block the order response
    });

    return NextResponse.json({
      id: order.id,
      order_number: order.order_number,
    });
  } catch (err) {
    console.error("Checkout error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
