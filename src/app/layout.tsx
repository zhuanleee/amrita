import type { Metadata, Viewport } from "next";
import { EB_Garamond, Noto_Serif_SC, Noto_Sans_SC, Outfit } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const ebGaramond = EB_Garamond({
  variable: "--font-eb-garamond",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const notoSerifSC = Noto_Serif_SC({
  variable: "--font-noto-serif-sc",
  subsets: ["latin"],
  weight: ["400", "600", "700", "900"],
});

const notoSansSC = Noto_Sans_SC({
  variable: "--font-noto-sans-sc",
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  title: {
    default: "甘露 AMRITA — Premium Herbal Mint Candy",
    template: "%s | 甘露 AMRITA",
  },
  description:
    "Premium sugar-free herbal mint candy from Malaysia. Traditional herbal tea formula meets modern wellness. 不只是凉，是凉茶的凉",
  keywords: [
    "herbal mint candy",
    "sugar free candy",
    "Malaysia candy",
    "凉茶薄荷糖",
    "甘露",
    "AMRITA",
    "herbal tea candy",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${outfit.variable} ${ebGaramond.variable} ${notoSerifSC.variable} ${notoSansSC.variable} font-[family-name:var(--font-outfit)] antialiased`}
      >
        {children}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
