import Link from "next/link";
import type { Product } from "@/lib/types";
import { SITE_TAGLINE } from "@/lib/constants";
import { ProductShowcase } from "./product-showcase";

const PLACEHOLDER_PRODUCTS: Product[] = [
  {
    id: "1",
    slug: "herbal-mint",
    name: "凉茶薄荷糖",
    name_en: "Herbal Mint Candy",
    price: 12.9,
    variant_color: "cream",
    metadata: { sugar_free: true, ingredients: ["Herbal tea extract", "Mint", "Xylitol"], benefits: ["Refreshing", "Sugar-free", "Traditional formula"] },
    description: "Traditional herbal tea formula in a sugar-free mint candy. A cooling sensation that goes beyond ordinary mint.",
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
    metadata: { sugar_free: true, ingredients: ["Chrysanthemum", "American Ginseng", "Mint", "Xylitol"], benefits: ["Cooling", "Energizing", "Sugar-free", "Herbal wellness"] },
    description: "Chrysanthemum and American Ginseng blended with refreshing mint. A premium sugar-free herbal candy for daily wellness.",
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

function DewdropLogoLarge() {
  return (
    <svg
      width="120"
      height="144"
      viewBox="0 0 60 72"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="animate-fade-in"
    >
      <path
        d="M30 4C30 4 6 32 6 46C6 59.2548 16.7452 68 30 68C43.2548 68 54 59.2548 54 46C54 32 30 4 30 4Z"
        fill="#f5f1ea"
        stroke="#8a7a5a"
        strokeWidth="2"
      />
      <text
        x="30"
        y="50"
        textAnchor="middle"
        fontSize="16"
        fontWeight="700"
        fill="#8a7a5a"
        fontFamily="var(--font-noto-serif-sc), serif"
      >
        甘露
      </text>
    </svg>
  );
}

export default function HomePage() {
  return (
    <>
      {/* Hero Section */}
      <section className="relative flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center px-4 text-center">
        {/* Corner ornaments */}
        <div className="pointer-events-none absolute inset-8 hidden lg:block">
          <svg className="absolute top-0 left-0 size-16 text-gold opacity-20" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="1">
            <path d="M0 32L0 0L32 0" />
            <path d="M0 24L0 8L16 8" />
          </svg>
          <svg className="absolute top-0 right-0 size-16 text-gold opacity-20" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="1">
            <path d="M64 32L64 0L32 0" />
            <path d="M64 24L64 8L48 8" />
          </svg>
          <svg className="absolute bottom-0 left-0 size-16 text-gold opacity-20" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="1">
            <path d="M0 32L0 64L32 64" />
            <path d="M0 40L0 56L16 56" />
          </svg>
          <svg className="absolute right-0 bottom-0 size-16 text-gold opacity-20" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="1">
            <path d="M64 32L64 64L32 64" />
            <path d="M64 40L64 56L48 56" />
          </svg>
        </div>

        <div className="space-y-6">
          <DewdropLogoLarge />

          <div className="space-y-2">
            <h1 className="font-serif-cn text-5xl font-bold tracking-wide text-foreground sm:text-6xl md:text-7xl">
              甘露
            </h1>
            <p className="font-[family-name:var(--font-eb-garamond)] text-2xl tracking-[0.3em] text-gold sm:text-3xl">
              AMRITA
            </p>
          </div>

          <p className="font-serif-cn text-lg text-muted-foreground sm:text-xl">
            {SITE_TAGLINE}
          </p>

          <Link
            href="/products"
            className="inline-flex h-11 items-center rounded-full gradient-gold px-8 text-sm font-medium tracking-wide text-amrita-cream transition-opacity hover:opacity-90"
          >
            Explore Our Candy
          </Link>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 animate-bounce">
          <svg className="size-6 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
          </svg>
        </div>
      </section>

      {/* Brand Story Section */}
      <section className="bg-card py-24">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="font-[family-name:var(--font-eb-garamond)] text-3xl font-semibold tracking-wide text-foreground sm:text-4xl">
              A Drop of Herbal Goodness
            </h2>
            <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground">
              Inspired by centuries-old herbal tea traditions, 甘露 AMRITA captures the essence
              of cooling herbal tea in a modern, sugar-free candy. Every piece is crafted with
              natural ingredients to bring you a moment of refreshing wellness.
            </p>
          </div>

          <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: (
                  <svg className="size-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 14.5M14.25 3.104c.251.023.501.05.75.082M19.8 14.5a2.25 2.25 0 010 3.182M19.8 14.5h-4.05m4.05 0a2.25 2.25 0 013.182 0M5 14.5a2.25 2.25 0 000 3.182M5 14.5H1m4 0a2.25 2.25 0 00-3.182 0" />
                  </svg>
                ),
                title: "Sugar Free",
                desc: "Sweetened naturally with xylitol for guilt-free enjoyment",
              },
              {
                icon: (
                  <svg className="size-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
                  </svg>
                ),
                title: "Natural Herbs",
                desc: "Real herbal extracts with authentic cooling properties",
              },
              {
                icon: (
                  <svg className="size-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                  </svg>
                ),
                title: "Traditional Formula",
                desc: "Recipes passed down through generations of herbal tea mastery",
              },
              {
                icon: (
                  <svg className="size-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                  </svg>
                ),
                title: "Made in Malaysia",
                desc: "Proudly crafted with quality ingredients in Malaysia",
              },
            ].map((item) => (
              <div key={item.title} className="flex flex-col items-center text-center">
                <div className="flex size-16 items-center justify-center rounded-2xl bg-amrita-gold/10 text-gold">
                  {item.icon}
                </div>
                <h3 className="mt-4 text-sm font-semibold uppercase tracking-wider text-foreground">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Product Showcase Section */}
      <section className="py-24">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="font-[family-name:var(--font-eb-garamond)] text-3xl font-semibold tracking-wide text-foreground sm:text-4xl">
              Our Collection
            </h2>
            <p className="mt-3 text-muted-foreground">
              Two distinct flavours, one refreshing experience
            </p>
          </div>

          <div className="mt-12">
            <ProductShowcase products={PLACEHOLDER_PRODUCTS} />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-card py-20">
        <div className="mx-auto max-w-2xl px-4 text-center">
          <h2 className="font-serif-cn text-2xl font-semibold text-foreground sm:text-3xl">
            体验不一样的凉
          </h2>
          <p className="mt-2 font-[family-name:var(--font-eb-garamond)] text-lg italic text-muted-foreground">
            Experience the difference
          </p>
          <Link
            href="/products"
            className="mt-8 inline-flex h-11 items-center rounded-full gradient-gold px-8 text-sm font-medium tracking-wide text-amrita-cream transition-opacity hover:opacity-90"
          >
            Shop Now
          </Link>
        </div>
      </section>
    </>
  );
}
