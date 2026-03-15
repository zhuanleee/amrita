import { CartProvider } from "@/components/storefront/cart-provider";
import { Navbar } from "@/components/storefront/navbar";
import { Footer } from "@/components/storefront/footer";
import { MetaPixel } from "@/components/storefront/meta-pixel";
import { UTMCapture } from "@/components/storefront/utm-capture";

export default function StorefrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <CartProvider>
      <MetaPixel />
      <UTMCapture />
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </div>
    </CartProvider>
  );
}
