"use client";

import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { useCart } from "@/lib/cart";
import { formatMYR } from "@/lib/currency";
import type { Product } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product);
    toast.success(`${product.name_en} added to bag`);
  };

  const isNavy = product.variant_color === "navy";

  return (
    <Link href={`/products/${product.slug}`} className="group block">
      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
        {/* Image placeholder */}
        <div
          className="relative aspect-square overflow-hidden"
          style={{
            background: isNavy
              ? "linear-gradient(135deg, #0c1a2a 0%, #1a2a3a 50%, #2a3a4a 100%)"
              : "linear-gradient(135deg, #f5f1ea 0%, #e8e4dd 50%, #ddd8d0 100%)",
          }}
        >
          {/* Decorative dewdrop shape */}
          <div className="absolute inset-0 flex items-center justify-center opacity-20">
            <svg width="120" height="144" viewBox="0 0 60 72" fill="none">
              <path
                d="M30 4C30 4 6 32 6 46C6 59.2548 16.7452 68 30 68C43.2548 68 54 59.2548 54 46C54 32 30 4 30 4Z"
                stroke={isNavy ? "#c8a96e" : "#8a7a5a"}
                strokeWidth="1.5"
                fill="none"
              />
            </svg>
          </div>

          {/* Sugar free badge */}
          {product.metadata?.sugar_free && (
            <div className="absolute top-3 left-3">
              <Badge className="bg-amrita-teal text-white border-0 text-xs">
                Sugar Free
              </Badge>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="space-y-3 p-5">
          <div>
            <h3 className="font-serif-cn text-lg font-semibold leading-tight text-foreground">
              {product.name}
            </h3>
            <p className="mt-0.5 text-sm text-muted-foreground">{product.name_en}</p>
          </div>

          <div className="flex items-center justify-between">
            <p className="text-lg font-semibold text-gold">
              {formatMYR(product.price)}
            </p>
            <Button
              size="sm"
              className="gradient-gold text-amrita-cream hover:opacity-90"
              onClick={handleAddToCart}
            >
              <ShoppingBag className="size-4" />
              Add
            </Button>
          </div>
        </div>
      </div>
    </Link>
  );
}
