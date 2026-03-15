import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { ProductDetail } from "./product-detail";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: product } = await supabase
    .from("products")
    .select("*")
    .eq("slug", slug)
    .single();
  if (!product) {
    return { title: "Product Not Found" };
  }
  return {
    title: `${product.name} ${product.name_en}`,
    description: product.description_en ?? product.description ?? undefined,
  };
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: product } = await supabase
    .from("products")
    .select("*")
    .eq("slug", slug)
    .single();

  if (!product) {
    return (
      <section className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-foreground">Product Not Found</h1>
          <p className="mt-2 text-muted-foreground">
            The product you are looking for does not exist.
          </p>
        </div>
      </section>
    );
  }

  const { data: variants } = await supabase
    .from("product_variants")
    .select("*")
    .eq("product_id", product.id)
    .order("sort_order");

  return <ProductDetail product={product} variants={variants || []} />;
}
