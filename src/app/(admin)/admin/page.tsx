"use client";

import { DollarSign, ShoppingCart, Clock, TrendingUp, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import Link from "next/link";

const MOCK_KPIS = {
  todayRevenue: 1250.80,
  todayOrders: 15,
  pendingOrders: 3,
  avgOrderValue: 42.50,
  totalCustomers: 234,
};

// 30-day mock revenue data
const revenueData = Array.from({ length: 30 }, (_, i) => {
  const date = new Date();
  date.setDate(date.getDate() - 29 + i);
  return {
    date: date.toLocaleDateString("en-MY", { month: "short", day: "numeric" }),
    revenue: Math.round((800 + Math.random() * 900) * 100) / 100,
  };
});

const MOCK_RECENT_ORDERS: {
  orderNumber: string;
  customer: string;
  items: number;
  total: number;
  status: OrderStatus;
  date: string;
}[] = [
  { orderNumber: "AMR-2026-0142", customer: "Tan Wei Ming", items: 3, total: 89.70, status: "delivered", date: "2026-03-14" },
  { orderNumber: "AMR-2026-0141", customer: "Siti Nurhaliza", items: 2, total: 45.00, status: "shipped", date: "2026-03-14" },
  { orderNumber: "AMR-2026-0140", customer: "Lim Kok Wai", items: 5, total: 125.50, status: "processing", date: "2026-03-13" },
  { orderNumber: "AMR-2026-0139", customer: "Ahmad Faizal", items: 1, total: 29.90, status: "pending_payment", date: "2026-03-13" },
  { orderNumber: "AMR-2026-0138", customer: "Priya Devi", items: 4, total: 98.00, status: "confirmed", date: "2026-03-12" },
];

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <KpiCard
          title="Today's Revenue"
          value={formatMYR(MOCK_KPIS.todayRevenue)}
          change={12.5}
          changeType="up"
          icon={DollarSign}
        />
        <KpiCard
          title="Today's Orders"
          value={String(MOCK_KPIS.todayOrders)}
          change={8.3}
          changeType="up"
          icon={ShoppingCart}
        />
        <KpiCard
          title="Pending Orders"
          value={String(MOCK_KPIS.pendingOrders)}
          change={-2}
          changeType="down"
          icon={Clock}
        />
        <KpiCard
          title="Avg Order Value"
          value={formatMYR(MOCK_KPIS.avgOrderValue)}
          change={3.2}
          changeType="up"
          icon={TrendingUp}
        />
        <KpiCard
          title="Total Customers"
          value={String(MOCK_KPIS.totalCustomers)}
          change={5.1}
          changeType="up"
          icon={Users}
        />
      </div>

      {/* Revenue Chart */}
      <Card className="bg-amrita-cream border-none shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Revenue (Last 30 Days)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="goldGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#c8a96e" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#c8a96e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => `RM ${v}`}
                />
                <Tooltip
                  formatter={(value) => [formatMYR(Number(value)), "Revenue"]}
                  contentStyle={{
                    backgroundColor: "#f5f1ea",
                    border: "1px solid #d5cfc6",
                    borderRadius: "8px",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#c8a96e"
                  strokeWidth={2}
                  fill="url(#goldGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Recent Orders */}
      <Card className="bg-amrita-cream border-none shadow-sm">
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle className="text-base">Recent Orders</CardTitle>
          <Link href="/admin/orders">
            <Button variant="outline" size="sm">View All</Button>
          </Link>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order #</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead className="text-center">Items</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {MOCK_RECENT_ORDERS.map((order) => (
                <TableRow key={order.orderNumber}>
                  <TableCell className="font-medium">{order.orderNumber}</TableCell>
                  <TableCell>{order.customer}</TableCell>
                  <TableCell className="text-center">{order.items}</TableCell>
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

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3">
        <Button className="bg-amrita-gold hover:bg-amrita-gold/90 text-white">
          Create Order
        </Button>
        <Button variant="outline">
          View Pending
        </Button>
        <Button variant="outline">
          Export Report
        </Button>
      </div>
    </div>
  );
}
