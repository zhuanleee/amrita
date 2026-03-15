"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
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
import { OrderStatusBadge } from "@/components/admin/order-status-badge";
import { formatMYR } from "@/lib/currency";
import type { OrderStatus } from "@/lib/types";
import Link from "next/link";

interface RevenueDataPoint {
  date: string;
  revenue: number;
}

interface RecentOrder {
  id: string;
  order_number: string;
  customer_name: string;
  total: number;
  status: OrderStatus;
  created_at: string;
  item_count: number;
}

export function RevenueChart({ data }: { data: RevenueDataPoint[] }) {
  if (data.length === 0) {
    return (
      <Card className="bg-amrita-cream border-none shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Revenue (Last 30 Days)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">
            No revenue data yet
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-amrita-cream border-none shadow-sm">
      <CardHeader>
        <CardTitle className="text-base">Revenue (Last 30 Days)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
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
  );
}

export function RecentOrdersTable({ orders }: { orders: RecentOrder[] }) {
  return (
    <Card className="bg-amrita-cream border-none shadow-sm">
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle className="text-base">Recent Orders</CardTitle>
        <Link href="/admin/orders">
          <Button variant="outline" size="sm">View All</Button>
        </Link>
      </CardHeader>
      <CardContent>
        {orders.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground">
            No orders yet
          </div>
        ) : (
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
              {orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">
                    <Link
                      href={`/admin/orders/${order.id}`}
                      className="text-amrita-gold hover:underline"
                    >
                      {order.order_number}
                    </Link>
                  </TableCell>
                  <TableCell>{order.customer_name}</TableCell>
                  <TableCell className="text-center">{order.item_count}</TableCell>
                  <TableCell className="text-right">{formatMYR(order.total)}</TableCell>
                  <TableCell>
                    <OrderStatusBadge status={order.status} />
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(order.created_at).toLocaleDateString("en-MY")}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
