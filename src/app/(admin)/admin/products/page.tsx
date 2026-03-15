"use client";

import { useState, useEffect } from "react";
import { Pencil, Trash2, Plus, Package } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatMYR } from "@/lib/currency";
import { createClient } from "@/lib/supabase/client";

interface ProductVariant {
  id: string;
  name: string;
  sku: string | null;
  price: number;
  stock: number;
  sort_order: number;
}

interface Product {
  id: string;
  name: string;
  sku: string | null;
  available: boolean;
  price: number;
  stock: number;
  product_variants: ProductVariant[];
}

export default function ProductsPage() {
  const [productList, setProductList] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient();

      const { data: products } = await supabase
        .from("products")
        .select("*, product_variants(*)")
        .order("created_at");

      setProductList((products as Product[]) ?? []);
      setLoading(false);
    };
    fetchData();
  }, []);

  if (loading) {
    return <div className="py-12 text-center text-muted-foreground">Loading...</div>;
  }

  return (
    <div className="space-y-4">
      {/* Actions */}
      <div className="flex justify-end">
        <Button className="bg-amrita-gold hover:bg-amrita-gold/90 text-white">
          <Plus className="size-4" />
          Add Product
        </Button>
      </div>

      {/* Products */}
      {productList.length === 0 ? (
        <Card className="bg-amrita-cream border-none shadow-sm">
          <CardContent className="py-8 text-center text-muted-foreground">
            No products yet
          </CardContent>
        </Card>
      ) : (
        productList.map((product) => (
          <Card key={product.id} className="bg-amrita-cream border-none shadow-sm">
            <CardContent className="pt-4">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="size-12 rounded-lg bg-amrita-gold-light/15 flex items-center justify-center">
                    <Package className="size-6 text-amrita-gold" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{product.name}</h3>
                    <p className="text-sm text-muted-foreground">SKU: {product.sku ?? "-"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className={product.available
                      ? "bg-emerald-100 text-emerald-800 border-emerald-200"
                      : "bg-red-100 text-red-800 border-red-200"
                    }
                  >
                    {product.available ? "Active" : "Inactive"}
                  </Badge>
                  <Button variant="ghost" size="icon-sm">
                    <Pencil className="size-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon-sm" className="text-red-500 hover:text-red-600">
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              </div>

              {product.product_variants && product.product_variants.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Variant</TableHead>
                      <TableHead>SKU</TableHead>
                      <TableHead className="text-right">Price</TableHead>
                      <TableHead className="text-right">Stock</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {product.product_variants
                      .sort((a: { sort_order: number }, b: { sort_order: number }) => a.sort_order - b.sort_order)
                      .map((variant: { id: string; name: string; sku: string | null; price: number; stock: number }) => (
                        <TableRow key={variant.id}>
                          <TableCell className="font-medium">{variant.name}</TableCell>
                          <TableCell className="text-muted-foreground font-mono text-xs">
                            {variant.sku ?? "-"}
                          </TableCell>
                          <TableCell className="text-right">{formatMYR(variant.price)}</TableCell>
                          <TableCell className="text-right">
                            <span className={variant.stock < 50 ? "text-amber-600 font-medium" : ""}>
                              {variant.stock}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="py-2 text-sm text-muted-foreground">
                  Base price: {formatMYR(product.price)} &middot; Stock: {product.stock}
                </div>
              )}
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}
