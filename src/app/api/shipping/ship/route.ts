import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createShipment, payAndGetAWB } from "@/lib/easyparcel";

export async function POST(request: Request) {
  try {
    const { order_id } = await request.json();

    if (!order_id) {
      return NextResponse.json({ error: "Missing order_id" }, { status: 400 });
    }

    const supabase = await createClient();

    // Fetch the order
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("*")
      .eq("id", order_id)
      .single();

    if (orderError || !order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (order.status === "shipped" || order.status === "delivered") {
      return NextResponse.json(
        { error: "Order is already shipped" },
        { status: 400 }
      );
    }

    // Determine service_id from order metadata
    const serviceId = (order.metadata as Record<string, unknown>)?.shipping_service_id as string | undefined;

    if (!serviceId) {
      return NextResponse.json(
        { error: "No shipping service selected for this order. Please use flat-rate shipping or re-checkout with a courier selected." },
        { status: 400 }
      );
    }

    // Calculate total weight from order items (default 0.3kg per item)
    const { data: items } = await supabase
      .from("order_items")
      .select("quantity")
      .eq("order_id", order_id);

    const totalItems = (items ?? []).reduce((sum, i) => sum + (i.quantity || 1), 0);
    const weightKg = Math.max(0.1, totalItems * 0.3);

    // Tomorrow as collect date
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const collectDate = tomorrow.toISOString().slice(0, 10);

    // Create shipment
    const shipment = await createShipment({
      serviceId,
      receiverName: order.customer_name,
      receiverPhone: order.customer_phone,
      receiverAddr1: order.shipping_address_line1,
      receiverAddr2: order.shipping_address_line2 ?? undefined,
      receiverCity: order.shipping_city,
      receiverPostcode: order.shipping_postcode,
      receiverState: order.shipping_state,
      weightKg,
      content: "AMRITA Herbal Mint Candy",
      collectDate,
    });

    if (!shipment || !shipment.order_no) {
      return NextResponse.json(
        { error: "Failed to create shipment with EasyParcel" },
        { status: 500 }
      );
    }

    // Pay and get AWB
    const awbResult = await payAndGetAWB(shipment.order_no);

    if (!awbResult || !awbResult.awb) {
      return NextResponse.json(
        { error: "Failed to get AWB from EasyParcel. Shipment created but not paid." },
        { status: 500 }
      );
    }

    // Update the order in Supabase
    const existingMetadata = (order.metadata as Record<string, unknown>) ?? {};
    const { error: updateError } = await supabase
      .from("orders")
      .update({
        tracking_number: awbResult.awb,
        status: "shipped",
        shipped_at: new Date().toISOString(),
        metadata: {
          ...existingMetadata,
          easyparcel_order_no: shipment.order_no,
          awb_label_url: awbResult.awb_label_url,
          tracking_url: awbResult.tracking_url,
        },
      })
      .eq("id", order_id);

    if (updateError) {
      console.error("Failed to update order after shipping:", updateError);
    }

    return NextResponse.json({
      awb: awbResult.awb,
      tracking_url: awbResult.tracking_url,
      label_url: awbResult.awb_label_url,
    });
  } catch (err) {
    console.error("Ship order error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
