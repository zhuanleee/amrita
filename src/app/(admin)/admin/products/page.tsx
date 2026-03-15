"use client";

import { useState, useEffect } from "react";
import { Pencil, Trash2, Plus, Package } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatMYR } from "@/lib/currency";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

interface ProductVariant {
  id: string;
  name: string;
  sku: string | null;
  price: number;
  stock: number;
  sort_order: number;
  available?: boolean;
}

interface Product {
  id: string;
  name: string;
  name_en: string | null;
  slug: string | null;
  description: string | null;
  description_en: string | null;
  sku: string | null;
  available: boolean;
  featured: boolean;
  price: number;
  stock: number;
  variant_color: string | null;
  category: string | null;
  product_variants: ProductVariant[];
}

interface ProductForm {
  name: string;
  name_en: string;
  price: string;
  sku: string;
  category: string;
  description: string;
  description_en: string;
  variant_color: string;
  featured: boolean;
  available: boolean;
}

interface VariantForm {
  name: string;
  price: string;
  sku: string;
  stock: string;
  sort_order: string;
}

const emptyProductForm: ProductForm = {
  name: "",
  name_en: "",
  price: "",
  sku: "",
  category: "",
  description: "",
  description_en: "",
  variant_color: "",
  featured: false,
  available: true,
};

const emptyVariantForm: VariantForm = {
  name: "",
  price: "",
  sku: "",
  stock: "0",
  sort_order: "0",
};

export default function ProductsPage() {
  const [productList, setProductList] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Product dialog state
  const [productDialogOpen, setProductDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productForm, setProductForm] = useState<ProductForm>(emptyProductForm);
  const [productSaving, setProductSaving] = useState(false);

  // Delete dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Variant dialog state
  const [variantDialogOpen, setVariantDialogOpen] = useState(false);
  const [variantProductId, setVariantProductId] = useState<string | null>(null);
  const [editingVariant, setEditingVariant] = useState<ProductVariant | null>(null);
  const [variantForm, setVariantForm] = useState<VariantForm>(emptyVariantForm);
  const [variantSaving, setVariantSaving] = useState(false);

  // Delete variant dialog
  const [deleteVariantDialogOpen, setDeleteVariantDialogOpen] = useState(false);
  const [deletingVariant, setDeletingVariant] = useState<{ productId: string; variant: ProductVariant } | null>(null);
  const [deletingVariantLoading, setDeletingVariantLoading] = useState(false);

  const fetchProducts = async () => {
    const supabase = createClient();
    const { data: products } = await supabase
      .from("products")
      .select("*, product_variants(*)")
      .order("created_at");

    setProductList((products as Product[]) ?? []);
    setLoading(false);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // ---- Product CRUD ----

  const openAddProduct = () => {
    setEditingProduct(null);
    setProductForm(emptyProductForm);
    setProductDialogOpen(true);
  };

  const openEditProduct = (product: Product) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name,
      name_en: product.name_en ?? "",
      price: String(product.price),
      sku: product.sku ?? "",
      category: product.category ?? "",
      description: product.description ?? "",
      description_en: product.description_en ?? "",
      variant_color: product.variant_color ?? "",
      featured: product.featured ?? false,
      available: product.available,
    });
    setProductDialogOpen(true);
  };

  const handleSaveProduct = async () => {
    if (!productForm.name.trim()) {
      toast.error("Product name is required");
      return;
    }

    setProductSaving(true);
    try {
      const payload = {
        name: productForm.name.trim(),
        name_en: productForm.name_en.trim() || null,
        description: productForm.description.trim() || null,
        description_en: productForm.description_en.trim() || null,
        price: parseFloat(productForm.price) || 0,
        sku: productForm.sku.trim() || null,
        category: productForm.category.trim() || null,
        variant_color: productForm.variant_color || null,
        featured: productForm.featured,
        available: productForm.available,
      };

      if (editingProduct) {
        // Update
        const res = await fetch(`/api/products/${editingProduct.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          const data = await res.json();
          toast.error(data.error || "Failed to update product");
          setProductSaving(false);
          return;
        }
        toast.success("Product updated!");
      } else {
        // Create
        const res = await fetch("/api/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          const data = await res.json();
          toast.error(data.error || "Failed to create product");
          setProductSaving(false);
          return;
        }
        toast.success("Product created!");
      }

      setProductDialogOpen(false);
      await fetchProducts();
    } catch {
      toast.error("Failed to save product");
    }
    setProductSaving(false);
  };

  const openDeleteProduct = (product: Product) => {
    setDeletingProduct(product);
    setDeleteDialogOpen(true);
  };

  const handleDeleteProduct = async () => {
    if (!deletingProduct) return;
    setDeleting(true);

    try {
      const res = await fetch(`/api/products/${deletingProduct.id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || "Failed to delete product");
        setDeleting(false);
        return;
      }
      toast.success("Product deleted!");
      setDeleteDialogOpen(false);
      await fetchProducts();
    } catch {
      toast.error("Failed to delete product");
    }
    setDeleting(false);
  };

  // ---- Variant CRUD ----

  const openAddVariant = (productId: string) => {
    setEditingVariant(null);
    setVariantProductId(productId);
    setVariantForm(emptyVariantForm);
    setVariantDialogOpen(true);
  };

  const openEditVariant = (productId: string, variant: ProductVariant) => {
    setEditingVariant(variant);
    setVariantProductId(productId);
    setVariantForm({
      name: variant.name,
      price: String(variant.price),
      sku: variant.sku ?? "",
      stock: String(variant.stock),
      sort_order: String(variant.sort_order),
    });
    setVariantDialogOpen(true);
  };

  const handleSaveVariant = async () => {
    if (!variantForm.name.trim() || !variantProductId) {
      toast.error("Variant name is required");
      return;
    }

    setVariantSaving(true);
    try {
      const payload = {
        name: variantForm.name.trim(),
        price: parseFloat(variantForm.price) || 0,
        sku: variantForm.sku.trim() || null,
        stock: parseInt(variantForm.stock) || 0,
        sort_order: parseInt(variantForm.sort_order) || 0,
      };

      if (editingVariant) {
        // Update
        const res = await fetch(`/api/products/${variantProductId}/variants`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: editingVariant.id, ...payload }),
        });
        if (!res.ok) {
          const data = await res.json();
          toast.error(data.error || "Failed to update variant");
          setVariantSaving(false);
          return;
        }
        toast.success("Variant updated!");
      } else {
        // Create
        const res = await fetch(`/api/products/${variantProductId}/variants`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          const data = await res.json();
          toast.error(data.error || "Failed to add variant");
          setVariantSaving(false);
          return;
        }
        toast.success("Variant added!");
      }

      setVariantDialogOpen(false);
      await fetchProducts();
    } catch {
      toast.error("Failed to save variant");
    }
    setVariantSaving(false);
  };

  const openDeleteVariant = (productId: string, variant: ProductVariant) => {
    setDeletingVariant({ productId, variant });
    setDeleteVariantDialogOpen(true);
  };

  const handleDeleteVariant = async () => {
    if (!deletingVariant) return;
    setDeletingVariantLoading(true);

    try {
      const res = await fetch(
        `/api/products/${deletingVariant.productId}/variants?variant_id=${deletingVariant.variant.id}`,
        { method: "DELETE" }
      );
      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || "Failed to delete variant");
        setDeletingVariantLoading(false);
        return;
      }
      toast.success("Variant deleted!");
      setDeleteVariantDialogOpen(false);
      await fetchProducts();
    } catch {
      toast.error("Failed to delete variant");
    }
    setDeletingVariantLoading(false);
  };

  if (loading) {
    return <div className="py-12 text-center text-muted-foreground">Loading...</div>;
  }

  return (
    <div className="space-y-4">
      {/* Actions */}
      <div className="flex justify-end">
        <Button
          className="bg-amrita-gold hover:bg-amrita-gold/90 text-white"
          onClick={openAddProduct}
        >
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
                  {product.featured && (
                    <Badge variant="outline" className="bg-amrita-gold/10 text-amrita-gold border-amrita-gold/20">
                      Featured
                    </Badge>
                  )}
                  <Badge
                    variant="outline"
                    className={product.available
                      ? "bg-emerald-100 text-emerald-800 border-emerald-200"
                      : "bg-red-100 text-red-800 border-red-200"
                    }
                  >
                    {product.available ? "Active" : "Inactive"}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => openEditProduct(product)}
                  >
                    <Pencil className="size-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="text-red-500 hover:text-red-600"
                    onClick={() => openDeleteProduct(product)}
                  >
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
                      <TableHead className="text-right w-[80px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {product.product_variants
                      .sort((a, b) => a.sort_order - b.sort_order)
                      .map((variant) => (
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
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="icon-sm"
                                onClick={() => openEditVariant(product.id, variant)}
                              >
                                <Pencil className="size-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon-sm"
                                className="text-red-500 hover:text-red-600"
                                onClick={() => openDeleteVariant(product.id, variant)}
                              >
                                <Trash2 className="size-3" />
                              </Button>
                            </div>
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

              <div className="mt-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openAddVariant(product.id)}
                  className="gap-1.5"
                >
                  <Plus className="size-3" />
                  Add Variant
                </Button>
              </div>
            </CardContent>
          </Card>
        ))
      )}

      {/* Product Add/Edit Dialog */}
      <Dialog open={productDialogOpen} onOpenChange={setProductDialogOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingProduct ? "Edit Product" : "Add Product"}</DialogTitle>
            <DialogDescription>
              {editingProduct ? "Update product details below." : "Fill in the product details below."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="p-name">Name (Chinese)</Label>
                <Input
                  id="p-name"
                  placeholder="e.g. 薄荷糖"
                  value={productForm.name}
                  onChange={(e) => setProductForm((f) => ({ ...f, name: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="p-name-en">Name (English)</Label>
                <Input
                  id="p-name-en"
                  placeholder="e.g. Mint Candy"
                  value={productForm.name_en}
                  onChange={(e) => setProductForm((f) => ({ ...f, name_en: e.target.value }))}
                />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="p-price">Price (MYR)</Label>
                <Input
                  id="p-price"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={productForm.price}
                  onChange={(e) => setProductForm((f) => ({ ...f, price: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="p-sku">SKU</Label>
                <Input
                  id="p-sku"
                  placeholder="e.g. AMR-001"
                  value={productForm.sku}
                  onChange={(e) => setProductForm((f) => ({ ...f, sku: e.target.value }))}
                />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="p-category">Category</Label>
                <Input
                  id="p-category"
                  placeholder="e.g. candy, herbal"
                  value={productForm.category}
                  onChange={(e) => setProductForm((f) => ({ ...f, category: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="p-color">Variant Color</Label>
                <Select
                  value={productForm.variant_color}
                  onValueChange={(v) => setProductForm((f) => ({ ...f, variant_color: v }))}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select color" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cream">Cream</SelectItem>
                    <SelectItem value="navy">Navy</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="p-desc">Description (Chinese)</Label>
              <Textarea
                id="p-desc"
                placeholder="Product description..."
                value={productForm.description}
                onChange={(e) => setProductForm((f) => ({ ...f, description: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="p-desc-en">Description (English)</Label>
              <Textarea
                id="p-desc-en"
                placeholder="Product description in English..."
                value={productForm.description_en}
                onChange={(e) => setProductForm((f) => ({ ...f, description_en: e.target.value }))}
              />
            </div>
            <div className="flex gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="size-4 accent-amrita-gold"
                  checked={productForm.featured}
                  onChange={(e) => setProductForm((f) => ({ ...f, featured: e.target.checked }))}
                />
                <span className="text-sm">Featured</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="size-4 accent-amrita-gold"
                  checked={productForm.available}
                  onChange={(e) => setProductForm((f) => ({ ...f, available: e.target.checked }))}
                />
                <span className="text-sm">Available</span>
              </label>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setProductDialogOpen(false)}
              disabled={productSaving}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveProduct}
              disabled={productSaving}
              className="bg-amrita-gold hover:bg-amrita-gold/90 text-white"
            >
              {productSaving ? "Saving..." : editingProduct ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Product Confirmation */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Product</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{deletingProduct?.name}&quot;? This will also delete all its variants. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteProduct}
              disabled={deleting}
            >
              {deleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Variant Add/Edit Dialog */}
      <Dialog open={variantDialogOpen} onOpenChange={setVariantDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingVariant ? "Edit Variant" : "Add Variant"}</DialogTitle>
            <DialogDescription>
              {editingVariant ? "Update variant details." : "Add a new variant to this product."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="v-name">Name</Label>
              <Input
                id="v-name"
                placeholder="e.g. Pack of 10"
                value={variantForm.name}
                onChange={(e) => setVariantForm((f) => ({ ...f, name: e.target.value }))}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="v-price">Price (MYR)</Label>
                <Input
                  id="v-price"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={variantForm.price}
                  onChange={(e) => setVariantForm((f) => ({ ...f, price: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="v-sku">SKU</Label>
                <Input
                  id="v-sku"
                  placeholder="e.g. AMR-001-10"
                  value={variantForm.sku}
                  onChange={(e) => setVariantForm((f) => ({ ...f, sku: e.target.value }))}
                />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="v-stock">Stock</Label>
                <Input
                  id="v-stock"
                  type="number"
                  min="0"
                  value={variantForm.stock}
                  onChange={(e) => setVariantForm((f) => ({ ...f, stock: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="v-sort">Sort Order</Label>
                <Input
                  id="v-sort"
                  type="number"
                  min="0"
                  value={variantForm.sort_order}
                  onChange={(e) => setVariantForm((f) => ({ ...f, sort_order: e.target.value }))}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setVariantDialogOpen(false)}
              disabled={variantSaving}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveVariant}
              disabled={variantSaving}
              className="bg-amrita-gold hover:bg-amrita-gold/90 text-white"
            >
              {variantSaving ? "Saving..." : editingVariant ? "Update" : "Add"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Variant Confirmation */}
      <Dialog open={deleteVariantDialogOpen} onOpenChange={setDeleteVariantDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Variant</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete variant &quot;{deletingVariant?.variant.name}&quot;? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteVariantDialogOpen(false)}
              disabled={deletingVariantLoading}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteVariant}
              disabled={deletingVariantLoading}
            >
              {deletingVariantLoading ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
