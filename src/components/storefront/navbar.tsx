"use client";

import { useState } from "react";
import Link from "next/link";
import { ShoppingBag, Menu } from "lucide-react";
import { useCart } from "@/lib/cart";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { CartDrawer } from "./cart-drawer";

function DewdropLogo({ className = "", size = 40 }: { className?: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 60 72"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M30 4C30 4 6 32 6 46C6 59.2548 16.7452 68 30 68C43.2548 68 54 59.2548 54 46C54 32 30 4 30 4Z"
        fill="#f5f1ea"
        stroke="#8a7a5a"
        strokeWidth="2.5"
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

export { DewdropLogo };

export function Navbar() {
  const { itemCount } = useCart();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-amrita-cream/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Mobile menu */}
        <div className="flex lg:hidden">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Open menu">
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 bg-amrita-cream">
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  <DewdropLogo size={32} />
                  <span className="font-[family-name:var(--font-eb-garamond)] text-lg tracking-[0.2em] text-gold">
                    AMRITA
                  </span>
                </SheetTitle>
              </SheetHeader>
              <nav className="mt-8 flex flex-col gap-4 px-4">
                <Link
                  href="/products"
                  onClick={() => setMobileOpen(false)}
                  className="text-base font-medium text-foreground transition-colors hover:text-gold"
                >
                  Shop
                </Link>
                <Link
                  href="/about"
                  onClick={() => setMobileOpen(false)}
                  className="text-base font-medium text-foreground transition-colors hover:text-gold"
                >
                  About
                </Link>
              </nav>
            </SheetContent>
          </Sheet>
        </div>

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5">
          <DewdropLogo size={36} />
          <span className="font-[family-name:var(--font-eb-garamond)] text-xl tracking-[0.2em] text-gold">
            AMRITA
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-8 lg:flex">
          <Link
            href="/products"
            className="text-sm font-medium tracking-wide text-foreground transition-colors hover:text-gold"
          >
            Shop
          </Link>
          <Link
            href="/about"
            className="text-sm font-medium tracking-wide text-foreground transition-colors hover:text-gold"
          >
            About
          </Link>
        </nav>

        {/* Cart */}
        <Sheet open={cartOpen} onOpenChange={setCartOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="relative" aria-label="Open cart">
              <ShoppingBag className="size-5" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 flex size-5 items-center justify-center rounded-full bg-amrita-teal text-[10px] font-semibold text-white">
                  {itemCount}
                </span>
              )}
            </Button>
          </SheetTrigger>
          <CartDrawer onClose={() => setCartOpen(false)} />
        </Sheet>
      </div>
    </header>
  );
}
