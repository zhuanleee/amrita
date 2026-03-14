import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About",
  description: "The story behind 甘露 AMRITA — premium herbal mint candy from Malaysia",
};

export default function AboutPage() {
  return (
    <div className="py-16">
      {/* Hero */}
      <section className="mx-auto max-w-3xl px-4 text-center">
        <p className="text-sm uppercase tracking-[0.3em] text-gold mb-4">Our Story</p>
        <h1 className="font-serif-cn text-4xl font-bold text-foreground sm:text-5xl">
          甘露
        </h1>
        <p className="mt-2 font-[family-name:var(--font-eb-garamond)] text-xl tracking-[0.2em] text-gold">
          AMRITA
        </p>
        <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
          Born from a love of traditional herbal tea culture, 甘露 AMRITA reimagines the
          cooling essence of herbal tea in a modern, sugar-free candy — crafted for those
          who seek natural refreshment without compromise.
        </p>
      </section>

      {/* Origin */}
      <section className="mx-auto mt-20 max-w-4xl px-4">
        <div className="grid gap-12 md:grid-cols-2 md:items-center">
          <div>
            <h2 className="font-[family-name:var(--font-eb-garamond)] text-2xl font-semibold text-foreground">
              From Herbal Tea to Candy
            </h2>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              In Malaysia, herbal tea is more than a drink — it&apos;s a way of life.
              Generations have relied on cooling herbal brews to beat the heat and restore
              balance. We asked a simple question: what if you could carry that same
              refreshing relief in your pocket?
            </p>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              甘露 — meaning &quot;sweet dew&quot; or &quot;nectar&quot; — captures the
              purest essence of herbal tea tradition. Each candy is a drop of herbal
              goodness, sweetened naturally and free from sugar.
            </p>
          </div>
          <div className="flex items-center justify-center">
            <div className="relative flex h-64 w-64 items-center justify-center rounded-full bg-card">
              <svg viewBox="0 0 120 144" className="h-40 w-32" fill="none">
                <path
                  d="M60 8C60 8 12 62 12 92C12 122.9 33.1 136 60 136C86.9 136 108 122.9 108 92C108 62 60 8 60 8Z"
                  fill="#f5f1ea"
                  stroke="#8a7a5a"
                  strokeWidth="2"
                />
                <text
                  x="60"
                  y="96"
                  textAnchor="middle"
                  fontSize="28"
                  fontWeight="700"
                  fill="#8a7a5a"
                  fontFamily="serif"
                >
                  甘露
                </text>
              </svg>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="mt-20 bg-card py-20">
        <div className="mx-auto max-w-4xl px-4">
          <h2 className="text-center font-[family-name:var(--font-eb-garamond)] text-2xl font-semibold text-foreground">
            What We Believe
          </h2>
          <div className="mt-12 grid gap-10 sm:grid-cols-3">
            {[
              {
                title: "Natural Ingredients",
                desc: "We use real herbal extracts — chrysanthemum, American ginseng, mint — sourced for quality and authenticity. No artificial colours, no artificial flavours.",
              },
              {
                title: "Sugar Free",
                desc: "Every candy is sweetened with natural alternatives. Enjoy the cooling relief of herbal tea without the sugar, guilt-free and suitable for health-conscious consumers.",
              },
              {
                title: "Malaysian Heritage",
                desc: "Proudly crafted in Malaysia, inspired by the herbal tea traditions of Southeast Asia. We honour the wisdom of generations while innovating for today.",
              },
            ].map((item) => (
              <div key={item.title} className="text-center">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-gold">
                  {item.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Products teaser */}
      <section className="mx-auto mt-20 max-w-3xl px-4 text-center">
        <h2 className="font-[family-name:var(--font-eb-garamond)] text-2xl font-semibold text-foreground">
          Two Flavours, One Philosophy
        </h2>
        <div className="mt-8 grid gap-6 sm:grid-cols-2">
          <div className="rounded-xl bg-card p-6">
            <div
              className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full"
              style={{ background: "linear-gradient(135deg, #f5f1ea, #e8e4dd)" }}
            >
              <span className="font-serif-cn text-2xl text-gold">薄</span>
            </div>
            <h3 className="font-serif-cn text-lg font-medium">凉茶薄荷糖</h3>
            <p className="text-sm text-muted-foreground">Herbal Mint Candy</p>
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
              The original. Traditional herbal tea formula with cooling mint — a
              refreshing classic.
            </p>
          </div>
          <div className="rounded-xl bg-card p-6">
            <div
              className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full"
              style={{ background: "linear-gradient(135deg, #0c1a2a, #1a2a3a)" }}
            >
              <span className="font-serif-cn text-2xl text-amrita-gold-light">菊</span>
            </div>
            <h3 className="font-serif-cn text-lg font-medium">菊花洋参薄荷糖</h3>
            <p className="text-sm text-muted-foreground">Chrysanthemum Ginseng Mint</p>
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
              The nourisher. Chrysanthemum and American ginseng blend for soothing,
              restorative coolness.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto mt-20 max-w-2xl px-4 text-center">
        <p className="font-serif-cn text-lg text-muted-foreground">
          不只是凉，是凉茶的凉
        </p>
        <p className="mt-1 font-[family-name:var(--font-eb-garamond)] italic text-muted-foreground">
          Not just cool — the cool of herbal tea.
        </p>
      </section>
    </div>
  );
}
