import type { Metadata } from "next";
import type { Product } from "@/lib/types";
import { ProductDetail } from "./product-detail";

const PLACEHOLDER_PRODUCTS: Record<string, Product> = {
  "herbal-mint": {
    id: "1",
    slug: "herbal-mint",
    name: "凉茶薄荷糖",
    name_en: "Herbal Mint Candy",
    price: 12.9,
    variant_color: "cream",
    metadata: {
      sugar_free: true,
      ingredients: ["Herbal tea extract", "Peppermint oil", "Xylitol", "Isomalt", "Natural flavouring"],
      weight: "45g",
      benefits: ["Refreshing herbal cooling", "Sugar-free", "Traditional formula", "Freshens breath"],
    },
    description:
      "源自传统凉茶配方，将凉茶的清凉精髓凝结于一颗薄荷糖中。无糖配方，以木糖醇天然甜味取代蔗糖，让你随时随地享受凉茶的清凉与回甘。",
    description_en:
      "Born from traditional herbal tea wisdom, this sugar-free mint candy captures the cooling essence of herbal tea in every piece. Sweetened naturally with xylitol, it delivers an authentic cooling sensation that goes beyond ordinary mint — this is the cool of herbal tea.",
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
  "chrysanthemum-ginseng-mint": {
    id: "2",
    slug: "chrysanthemum-ginseng-mint",
    name: "菊花洋参薄荷糖",
    name_en: "Chrysanthemum Ginseng Mint",
    price: 14.9,
    variant_color: "navy",
    metadata: {
      sugar_free: true,
      ingredients: ["Chrysanthemum extract", "American Ginseng extract", "Peppermint oil", "Xylitol", "Isomalt", "Natural flavouring"],
      weight: "45g",
      benefits: ["Cooling & energizing", "Sugar-free", "Chrysanthemum clarity", "Ginseng vitality"],
    },
    description:
      "菊花清热明目，洋参提神补气，薄荷清凉舒爽——三味草本精华融为一体。无糖配方，让传统草本养生智慧融入你的日常。",
    description_en:
      "A premium fusion of chrysanthemum for clarity, American ginseng for vitality, and refreshing mint for that signature cool. Sugar-free and crafted with real herbal extracts, this is daily wellness in every piece.",
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
};

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = PLACEHOLDER_PRODUCTS[slug];
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
  const product = PLACEHOLDER_PRODUCTS[slug];

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

  return <ProductDetail product={product} />;
}
