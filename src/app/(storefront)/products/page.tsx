import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { ProductShowcase } from "../product-showcase";

export const metadata: Metadata = {
  title: "Our Collection",
  description: "Browse our premium sugar-free herbal mint candy collection.",
};

export default async function ProductsPage() {
  const supabase = await createClient();
  const { data: products } = await supabase
    .from("products")
    .select("*")
    .eq("available", true);
  return (
    <section className="py-16">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="font-[family-name:var(--font-eb-garamond)] text-4xl font-semibold tracking-wide text-foreground">
            Our Collection
          </h1>
          <p className="mt-3 text-muted-foreground">
            Premium sugar-free herbal mint candy, crafted with care
          </p>
        </div>

        <div className="mt-12">
          <ProductShowcase products={products || []} />
        </div>
      </div>
    </section>
  );
}
