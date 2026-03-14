"use client";

import type { Product } from "@/lib/types";
import { ProductCard } from "@/components/storefront/product-card";

interface ProductShowcaseProps {
  products: Product[];
}

export function ProductShowcase({ products }: ProductShowcaseProps) {
  return (
    <div className="grid gap-8 sm:grid-cols-2">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
