"use client";

import { useState } from "react";
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
import { ORDER_STATUS_LABELS, type OrderStatus } from "@/lib/types";

const MOCK_ORDERS: {
  id: string;
  orderNumber: string;
  customer: string;
  phone: string;
  items: number;
  total: number;
  payment: string;
  status: OrderStatus;
  date: string;
}[] = [
  { id: "1", orderNumber: "AMR-2026-0142", customer: "Tan Wei Ming", phone: "+60 12-345 6789", items: 3, total: 89.70, payment: "Billplz", status: "delivered", date: "2026-03-14" },
  { id: "2", orderNumber: "AMR-2026-0141", customer: "Siti Nurhaliza", phone: "+60 13-456 7890", items: 2, total: 45.00, payment: "Billplz", status: "shipped", date: "2026-03-14" },
  { id: "3", orderNumber: "AMR-2026-0140", customer: "Lim Kok Wai", phone: "+60 11-234 5678", items: 5, total: 125.50, payment: "Billplz", status: "processing", date: "2026-03-13" },
  { id: "4", orderNumber: "AMR-2026-0139", customer: "Ahmad Faizal", phone: "+60 19-876 5432", items: 1, total: 29.90, payment: "Bank Transfer", status: "pending_payment", date: "2026-03-13" },
  { id: "5", orderNumber: "AMR-2026-0138", customer: "Priya Devi", phone: "+60 16-543 2109", items: 4, total: 98.00, payment: "Billplz", status: "confirmed", date: "2026-03-12" },
  { id: "6", orderNumber: "AMR-2026-0137", customer: "Chong Mei Ling", phone: "+60 17-654 3210", items: 2, total: 55.80, payment: "Billplz", status: "paid", date: "2026-03-12" },
  { id: "7", orderNumber: "AMR-2026-0136", customer: "Raj Kumar", phone: "+60 14-765 4321", items: 6, total: 168.00, payment: "Billplz", status: "delivered", date: "2026-03-11" },
  { id: "8", orderNumber: "AMR-2026-0135", customer: "Nurul Izzah", phone: "+60 18-987 6543", items: 1, total: 29.90, payment: "Bank Transfer", status: "cancelled", date: "2026-03-11" },
  { id: "9", orderNumber: "AMR-2026-0134", customer: "Lee Chun Hao", phone: "+60 12-876 5430", items: 3, total: 79.70, payment: "Billplz", status: "refunded", date: "2026-03-10" },
  { id: "10", orderNumber: "AMR-2026-0133", customer: "Aisha Binti Ali", phone: "+60 15-432 1098", items: 2, total: 59.80, payment: "Billplz", status: "delivered", date: "2026-03-10" },
];

export default function OrdersPage() {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [search, setSearch] = useState("");

  const filteredOrders = MOCK_ORDERS.filter((order) => {
    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    const matchesSearch =
      search === "" ||
      order.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
      order.customer.toLowerCase().includes(search.toLowerCase());
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
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order #</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead className="hidden md:table-cell">Phone</TableHead>
                <TableHead className="text-center">Items</TableHead>
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
                      {order.orderNumber}
                    </Link>
                  </TableCell>
                  <TableCell>{order.customer}</TableCell>
                  <TableCell className="hidden md:table-cell text-muted-foreground">
                    {order.phone}
                  </TableCell>
                  <TableCell className="text-center">{order.items}</TableCell>
                  <TableCell className="text-right">{formatMYR(order.total)}</TableCell>
                  <TableCell className="hidden sm:table-cell text-muted-foreground">
                    {order.payment}
                  </TableCell>
                  <TableCell>
                    <OrderStatusBadge status={order.status} />
                  </TableCell>
                  <TableCell className="hidden lg:table-cell text-muted-foreground">
                    {order.date}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Pagination Placeholder */}
          <div className="flex items-center justify-between pt-4 border-t mt-4">
            <p className="text-sm text-muted-foreground">
              Showing {filteredOrders.length} of {MOCK_ORDERS.length} orders
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
