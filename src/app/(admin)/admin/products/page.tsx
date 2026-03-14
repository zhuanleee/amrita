"use client";

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

const MOCK_PRODUCTS = [
  {
    id: "1",
    name: "Herbal Mint Original",
    sku: "AMR-HMO",
    price: 29.90,
    image: null,
    available: true,
    variants: [
      { name: "Tin (40g)", sku: "AMR-HMO-TIN", price: 29.90, stock: 150 },
      { name: "Pouch (20g)", sku: "AMR-HMO-PCH", price: 15.90, stock: 200 },
      { name: "Box of 6 Tins", sku: "AMR-HMO-B6", price: 149.00, stock: 45 },
    ],
  },
  {
    id: "2",
    name: "Herbal Mint Extra Strong",
    sku: "AMR-HMS",
    price: 32.90,
    image: null,
    available: true,
    variants: [
      { name: "Tin (40g)", sku: "AMR-HMS-TIN", price: 32.90, stock: 120 },
      { name: "Pouch (20g)", sku: "AMR-HMS-PCH", price: 17.90, stock: 180 },
      { name: "Box of 6 Tins", sku: "AMR-HMS-B6", price: 159.00, stock: 30 },
    ],
  },
];

export default function ProductsPage() {
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
      {MOCK_PRODUCTS.map((product) => (
        <Card key={product.id} className="bg-amrita-cream border-none shadow-sm">
          <CardContent className="pt-4">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="size-12 rounded-lg bg-amrita-gold-light/15 flex items-center justify-center">
                  <Package className="size-6 text-amrita-gold" />
                </div>
                <div>
                  <h3 className="font-semibold">{product.name}</h3>
                  <p className="text-sm text-muted-foreground">SKU: {product.sku}</p>
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
                {product.variants.map((variant) => (
                  <TableRow key={variant.sku}>
                    <TableCell className="font-medium">{variant.name}</TableCell>
                    <TableCell className="text-muted-foreground font-mono text-xs">
                      {variant.sku}
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
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
