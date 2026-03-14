"use client";

import Link from "next/link";
import { ArrowLeft, ShoppingCart, DollarSign, TrendingUp, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { KpiCard } from "@/components/admin/kpi-card";
import { OrderStatusBadge } from "@/components/admin/order-status-badge";
import { formatMYR } from "@/lib/currency";
import type { OrderStatus } from "@/lib/types";

const MOCK_CUSTOMER = {
  id: "1",
  name: "Tan Wei Ming",
  email: "wm.tan@email.com",
  phone: "+60 12-345 6789",
  memberSince: "2025-08-15",
  segment: "Champion" as const,
  totalOrders: 12,
  ltv: 1280.50,
  avgOrderValue: 106.71,
  daysSinceLastOrder: 0,
  tags: ["Repeat Buyer", "Wholesale Inquiry", "Gift Buyer"],
  notes: "Prefers extra strong variant. Orders regularly for office. Interested in wholesale pricing for 50+ tins.",
  orders: [
    { orderNumber: "AMR-2026-0142", total: 89.70, status: "delivered" as OrderStatus, date: "2026-03-14" },
    { orderNumber: "AMR-2026-0128", total: 149.00, status: "delivered" as OrderStatus, date: "2026-02-28" },
    { orderNumber: "AMR-2026-0101", total: 59.80, status: "delivered" as OrderStatus, date: "2026-02-10" },
    { orderNumber: "AMR-2025-0089", total: 199.00, status: "delivered" as OrderStatus, date: "2025-12-20" },
    { orderNumber: "AMR-2025-0065", total: 45.00, status: "delivered" as OrderStatus, date: "2025-10-05" },
  ],
};

export default function CustomerDetailPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Link href="/admin/customers">
            <Button variant="ghost" size="icon-sm">
              <ArrowLeft className="size-4" />
            </Button>
          </Link>
          <div>
            <h2 className="text-xl font-semibold">{MOCK_CUSTOMER.name}</h2>
            <p className="text-sm text-muted-foreground">
              {MOCK_CUSTOMER.email} &middot; {MOCK_CUSTOMER.phone}
            </p>
            <p className="text-xs text-muted-foreground">
              Member since {MOCK_CUSTOMER.memberSince}
            </p>
          </div>
        </div>
        <Badge
          variant="outline"
          className="bg-emerald-100 text-emerald-800 border-emerald-200 w-fit"
        >
          {MOCK_CUSTOMER.segment}
        </Badge>
      </div>

      {/* KPI Row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard title="Total Orders" value={String(MOCK_CUSTOMER.totalOrders)} icon={ShoppingCart} />
        <KpiCard title="Lifetime Value" value={formatMYR(MOCK_CUSTOMER.ltv)} icon={DollarSign} />
        <KpiCard title="Avg Order Value" value={formatMYR(MOCK_CUSTOMER.avgOrderValue)} icon={TrendingUp} />
        <KpiCard title="Days Since Last Order" value={String(MOCK_CUSTOMER.daysSinceLastOrder)} icon={Clock} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Orders History */}
        <div className="lg:col-span-2">
          <Card className="bg-amrita-cream border-none shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">Order History</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order #</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {MOCK_CUSTOMER.orders.map((order) => (
                    <TableRow key={order.orderNumber}>
                      <TableCell className="font-medium text-amrita-gold">
                        {order.orderNumber}
                      </TableCell>
                      <TableCell className="text-right">{formatMYR(order.total)}</TableCell>
                      <TableCell>
                        <OrderStatusBadge status={order.status} />
                      </TableCell>
                      <TableCell className="text-muted-foreground">{order.date}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        {/* Notes & Tags */}
        <div className="space-y-6">
          <Card className="bg-amrita-cream border-none shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">Tags</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {MOCK_CUSTOMER.tags.map((tag) => (
                  <Badge key={tag} variant="secondary">{tag}</Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-amrita-cream border-none shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">Notes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Textarea
                defaultValue={MOCK_CUSTOMER.notes}
                rows={5}
                className="resize-none"
              />
              <Button size="sm" className="bg-amrita-gold hover:bg-amrita-gold/90 text-white">
                Save Notes
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
