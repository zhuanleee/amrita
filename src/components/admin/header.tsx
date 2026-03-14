"use client";

import { Bell, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AdminHeaderProps {
  title: string;
  onMenuToggle?: () => void;
}

export function AdminHeader({ title, onMenuToggle }: AdminHeaderProps) {
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border bg-amrita-cream px-4 lg:px-6">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={onMenuToggle}
        >
          <Menu className="size-5" />
        </Button>
        <h1 className="text-lg font-semibold">{title}</h1>
      </div>
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="size-5" />
          <span className="absolute top-1.5 right-1.5 size-2 rounded-full bg-red-500" />
        </Button>
        <div className="flex items-center gap-2">
          <div className="size-8 rounded-full bg-amrita-gold/20 flex items-center justify-center text-sm font-medium text-amrita-gold">
            A
          </div>
          <span className="hidden text-sm font-medium sm:block">Admin</span>
        </div>
      </div>
    </header>
  );
}
