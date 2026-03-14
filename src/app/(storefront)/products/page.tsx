import type { Metadata } from "next";
import type { Product } from "@/lib/types";
import { ProductShowcase } from "../product-showcase";

export const metadata: Metadata = {
  title: "Our Collection",
  description: "Browse our premium sugar-free herbal mint candy collection.",
};

const PLACEHOLDER_PRODUCTS: Product[] = [
  {
    id: "1",
    slug: "herbal-mint",
    name: "凉茶薄荷糖",
    name_en: "Herbal Mint Candy",
    price: 12.9,
    variant_color: "cream",
    metadata: { sugar_free: true, ingredients: ["Herbal tea extract", "Mint", "Xylitol"] },
    description: "Traditional herbal tea formula in a sugar-free mint candy.",
    description_en: "Traditional herbal tea formula in a sugar-free mint candy.",
    category: "candy",
    compare_at_price: null,
    cost_price: null,
    sku: "AMR-HM-001",
    stock: 100,
    weight_grams: 45,
    badge: null,
    featured: true,
    available: true,
    image_urls: [],
    created_at: "",
    updated_at: "",
  },
  {
    id: "2",
    slug: "chrysanthemum-ginseng-mint",
    name: "菊花洋参薄荷糖",
    name_en: "Chrysanthemum Ginseng Mint",
    price: 14.9,
    variant_color: "navy",
    metadata: { sugar_free: true, ingredients: ["Chrysanthemum", "American Ginseng", "Mint", "Xylitol"] },
    description: "Chrysanthemum and American Ginseng blended with refreshing mint.",
    description_en: "Chrysanthemum and American Ginseng blended with refreshing mint.",
    category: "candy",
    compare_at_price: null,
    cost_price: null,
    sku: "AMR-CG-001",
    stock: 100,
    weight_grams: 45,
    badge: null,
    featured: true,
    available: true,
    image_urls: [],
    created_at: "",
    updated_at: "",
  },
];

export default function ProductsPage() {
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
          <ProductShowcase products={PLACEHOLDER_PRODUCTS} />
        </div>
      </div>
    </section>
  );
}
