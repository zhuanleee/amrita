import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// POST /api/products — Create a new product
export async function POST(request: Request) {
  const supabase = await createClient();

  try {
    const body = await request.json();

    const {
      name,
      name_en,
      slug,
      description,
      description_en,
      price,
      sku,
      variant_color,
      category,
      metadata,
      featured,
      available,
    } = body;

    if (!name) {
      return NextResponse.json({ error: "Product name is required" }, { status: 400 });
    }

    const productSlug = slug || slugify(name_en || name);

    const { data, error } = await supabase
      .from("products")
      .insert({
        name,
        name_en: name_en || null,
        slug: productSlug,
        description: description || null,
        description_en: description_en || null,
        price: price ?? 0,
        sku: sku || null,
        variant_color: variant_color || null,
        category: category || null,
        metadata: metadata || {},
        featured: featured ?? false,
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
