"use client";

import { type LucideIcon, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface KpiCardProps {
  title: string;
  value: string;
  change?: number;
  changeType?: "up" | "down" | "neutral";
  icon: LucideIcon;
}

export function KpiCard({ title, value, change, changeType = "neutral", icon: Icon }: KpiCardProps) {
  return (
    <Card className="bg-amrita-cream border-none shadow-sm">
      <CardContent className="pt-4 pb-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-2xl font-semibold tracking-tight">{value}</p>
            {change !== undefined && (
              <div className="flex items-center gap-1 text-xs">
                {changeType === "up" && <TrendingUp className="size-3 text-emerald-600" />}
                {changeType === "down" && <TrendingDown className="size-3 text-red-500" />}
                {changeType === "neutral" && <Minus className="size-3 text-muted-foreground" />}
                <span
                  className={cn(
                    changeType === "up" && "text-emerald-600",
                    changeType === "down" && "text-red-500",
                    changeType === "neutral" && "text-muted-foreground"
                  )}
                >
                  {changeType === "up" ? "+" : ""}
                  {change}%
                </span>
                <span className="text-muted-foreground">vs yesterday</span>
              </div>
            )}
          </div>
          <div className="rounded-lg bg-amrita-gold-light/15 p-2">
            <Icon className="size-5 text-amrita-gold" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
