import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// POST /api/products/[id]/variants — Add variant
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();
  const { id: productId } = await params;

  try {
    const body = await request.json();
    const { name, price, sku, sort_order, stock, available } = body;

    if (!name) {
      return NextResponse.json({ error: "Variant name is required" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("product_variants")
      .insert({
        product_id: productId,
        name,
        price: price ?? 0,
        sku: sku || null,
        sort_order: sort_order ?? 0,
        stock: stock ?? 0,
        available: available ?? true,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
}

// PUT /api/products/[id]/variants — Update variant (variant id in body)
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();
  const { id: productId } = await params;

  try {
    const body = await request.json();
    const { id: variantId, ...updateData } = body;

    if (!variantId) {
      return NextResponse.json({ error: "Variant id is required" }, { status: 400 });
    }

    // Remove fields that should not be updated
    delete updateData.product_id;
    delete updateData.created_at;

    const { data, error } = await supabase
      .from("product_variants")
      .update(updateData)
      .eq("id", variantId)
      .eq("product_id", productId)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
}

// DELETE /api/products/[id]/variants — Delete variant (variant id in body or query)
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();
  const { id: productId } = await params;

  // Try query param first, then body
  const url = new URL(request.url);
  let variantId = url.searchParams.get("variant_id");

  if (!variantId) {
    try {
      const body = await request.json();
      variantId = body.id || body.variant_id;
    } catch {
      // no body
    }
  }

  if (!variantId) {
    return NextResponse.json({ error: "Variant id is required" }, { status: 400 });
  }

  const { error } = await supabase
    .from("product_variants")
    .delete()
    .eq("id", variantId)
    .eq("product_id", productId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
