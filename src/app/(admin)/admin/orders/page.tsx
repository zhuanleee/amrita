"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { ORDER_STATUS_LABELS, type OrderStatus, type Order } from "@/lib/types";
import { createClient } from "@/lib/supabase/client";

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setOrders(data ?? []);
        setLoading(false);
      });
  }, []);

  const filteredOrders = orders.filter((order) => {
    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    const matchesSearch =
      search === "" ||
      order.order_number.toLowerCase().includes(search.toLowerCase()) ||
      order.customer_name.toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-4">
      {/* Filter Bar */}
      <Card className="bg-amrita-cream border-none shadow-sm">
        <CardContent className="pt-4 pb-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by order number or customer..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {(Object.entries(ORDER_STATUS_LABELS) as [OrderStatus, string][]).map(
                  ([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  )
                )}
              </SelectContent>
            </Select>
            <Input type="date" className="w-[150px]" />
            <Input type="date" className="w-[150px]" />
          </div>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card className="bg-amrita-cream border-none shadow-sm">
        <CardContent className="pt-4">
          {loading ? (
            <div className="py-8 text-center text-muted-foreground">Loading orders...</div>
          ) : filteredOrders.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              {orders.length === 0 ? "No orders yet" : "No orders match your filters"}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order #</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead className="hidden md:table-cell">Phone</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="hidden sm:table-cell">Payment</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden lg:table-cell">Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.map((order) => (
                  <TableRow key={order.id} className="cursor-pointer">
                    <TableCell>
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="font-medium text-amrita-gold hover:underline"
                      >
                        {order.order_number}
                      </Link>
                    </TableCell>
                    <TableCell>{order.customer_name}</TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground">
                      {order.customer_phone}
                    </TableCell>
                    <TableCell className="text-right">{formatMYR(order.total)}</TableCell>
                    <TableCell className="hidden sm:table-cell text-muted-foreground">
                      {order.payment_method ?? "-"}
                    </TableCell>
                    <TableCell>
                      <OrderStatusBadge status={order.status} />
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-muted-foreground">
                      {new Date(order.created_at).toLocaleDateString("en-MY")}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {/* Pagination Placeholder */}
          <div className="flex items-center justify-between pt-4 border-t mt-4">
            <p className="text-sm text-muted-foreground">
              Showing {filteredOrders.length} of {orders.length} orders
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled>
                Previous
              </Button>
              <Button variant="outline" size="sm" disabled>
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
