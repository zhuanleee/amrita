"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ShoppingCart,
  Users,
  Package,
  BarChart3,
  Megaphone,
  Settings,
  Store,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetTitle,
} from "@/components/ui/sheet";

const navItems = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Orders", href: "/admin/orders", icon: ShoppingCart },
  { label: "Customers", href: "/admin/customers", icon: Users },
  { label: "Products", href: "/admin/products", icon: Package },
  { label: "Analytics", href: "/admin/analytics", icon: BarChart3 },
  { label: "Marketing", href: "/admin/marketing", icon: Megaphone },
  { label: "Settings", href: "/admin/settings", icon: Settings },
];

function SidebarContent() {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col bg-amrita-navy text-white/80">
      {/* Logo */}
      <div className="flex items-center gap-2 px-6 py-5 border-b border-white/10">
        <span className="font-serif text-xl text-amrita-gold-light font-semibold">
          甘露
        </span>
        <span className="text-sm font-medium tracking-wider text-amrita-gold-light uppercase">
          AMRITA
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navItems.map((item) => {
          const isActive =
            item.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-amrita-gold-light/15 text-amrita-gold-light"
                  : "text-white/60 hover:bg-white/5 hover:text-white/90"
              )}
            >
              <item.icon className="size-4 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Back to Store */}
      <div className="border-t border-white/10 px-3 py-4">
        <Link
          href="/"
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-white/60 hover:bg-white/5 hover:text-white/90 transition-colors"
        >
          <Store className="size-4 shrink-0" />
          Back to Store
        </Link>
      </div>
    </div>
  );
}

interface AdminSidebarProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AdminSidebar({ open, onOpenChange }: AdminSidebarProps) {
  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 lg:z-40">
        <SidebarContent />
      </aside>

      {/* Mobile sidebar */}
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="left" className="w-64 p-0 bg-amrita-navy border-none" showCloseButton={false}>
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <SidebarContent />
        </SheetContent>
      </Sheet>
    </>
  );
}
