"use client";

import { useState } from "react";
import { AdminSidebar } from "@/components/admin/sidebar";
import { AdminHeader } from "@/components/admin/header";
import { usePathname } from "next/navigation";

const pageTitles: Record<string, string> = {
  "/admin": "Dashboard",
  "/admin/orders": "Orders",
  "/admin/customers": "Customers",
  "/admin/products": "Products",
  "/admin/analytics": "Analytics",
  "/admin/marketing": "Marketing",
  "/admin/settings": "Settings",
};

function getPageTitle(pathname: string): string {
  // Exact match first
  if (pageTitles[pathname]) return pageTitles[pathname];
  // Check for order detail
  if (pathname.startsWith("/admin/orders/")) return "Order Details";
  if (pathname.startsWith("/admin/customers/")) return "Customer Details";
  if (pathname.startsWith("/admin/products/")) return "Product Details";
  // Fallback: find closest parent
  const segments = pathname.split("/").filter(Boolean);
  while (segments.length > 0) {
    const path = "/" + segments.join("/");
    if (pageTitles[path]) return pageTitles[path];
    segments.pop();
  }
  return "Admin";
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const title = getPageTitle(pathname);

  return (
    <div className="min-h-screen bg-amrita-page-bg">
      <AdminSidebar open={sidebarOpen} onOpenChange={setSidebarOpen} />
      <div className="lg:pl-64">
        <AdminHeader
          title={title}
          onMenuToggle={() => setSidebarOpen(true)}
        />
        <main className="p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
