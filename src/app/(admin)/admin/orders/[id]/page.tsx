"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { OrderStatusBadge } from "@/components/admin/order-status-badge";
import { formatMYR } from "@/lib/currency";
import { ORDER_STATUS_LABELS, type OrderStatus } from "@/lib/types";

const MOCK_ORDER = {
  id: "1",
  orderNumber: "AMR-2026-0142",
  status: "processing" as OrderStatus,
  createdAt: "2026-03-13 14:32",
  customer: {
    name: "Tan Wei Ming",
    email: "wm.tan@email.com",
    phone: "+60 12-345 6789",
  },
  shipping: {
    line1: "12, Jalan Bukit Bintang",
    line2: "Lot 3A",
    city: "Kuala Lumpur",
    postcode: "50200",
    state: "Kuala Lumpur",
  },
  payment: {
    method: "Billplz",
    status: "Paid",
    ref: "BPZ-8847291",
    paidAt: "2026-03-13 14:35",
  },
  items: [
    { product: "Herbal Mint Original", variant: "Tin (40g)", qty: 2, price: 29.90, lineTotal: 59.80 },
    { product: "Herbal Mint Extra Strong", variant: "Pouch (20g)", qty: 1, price: 15.90, lineTotal: 15.90 },
    { product: "Herbal Mint Original", variant: "Box of 6 Tins", qty: 1, price: 149.00, lineTotal: 149.00 },
  ],
  subtotal: 224.70,
  shippingFee: 8.00,
  discount: 5.00,
  total: 227.70,
};

export default function OrderDetailPage() {
  const [status, setStatus] = useState<string>(MOCK_ORDER.status);

  return (
    <div className="space-y-6">
      {/* Back button + Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Link href="/admin/orders">
            <Button variant="ghost" size="icon-sm">
              <ArrowLeft className="size-4" />
            </Button>
          </Link>
          <div>
            <h2 className="text-xl font-semibold">{MOCK_ORDER.orderNumber}</h2>
            <p className="text-sm text-muted-foreground">{MOCK_ORDER.createdAt}</p>
          </div>
        </div>
        <OrderStatusBadge status={MOCK_ORDER.status} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - Order Items */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-amrita-cream border-none shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">Order Items</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Variant</TableHead>
                    <TableHead className="text-center">Qty</TableHead>
                    <TableHead className="text-right">Price</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {MOCK_ORDER.items.map((item, i) => (
                    <TableRow key={i}>
                      <TableCell className="font-medium">{item.product}</TableCell>
                      <TableCell className="text-muted-foreground">{item.variant}</TableCell>
                      <TableCell className="text-center">{item.qty}</TableCell>
                      <TableCell className="text-right">{formatMYR(item.price)}</TableCell>
                      <TableCell className="text-right">{formatMYR(item.lineTotal)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
                <TableFooter>
                  <TableRow>
                    <TableCell colSpan={4} className="text-right">Subtotal</TableCell>
                    <TableCell className="text-right">{formatMYR(MOCK_ORDER.subtotal)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell colSpan={4} className="text-right">Shipping</TableCell>
                    <TableCell className="text-right">{formatMYR(MOCK_ORDER.shippingFee)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell colSpan={4} className="text-right">Discount</TableCell>
                    <TableCell className="text-right text-red-600">-{formatMYR(MOCK_ORDER.discount)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell colSpan={4} className="text-right font-semibold">Total</TableCell>
                    <TableCell className="text-right font-semibold">{formatMYR(MOCK_ORDER.total)}</TableCell>
                  </TableRow>
                </TableFooter>
              </Table>
            </CardContent>
          </Card>

          {/* Status Update */}
          <Card className="bg-amrita-cream border-none shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">Update Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(Object.entries(ORDER_STATUS_LABELS) as [OrderStatus, string][]).map(
                      ([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      )
                    )}
                  </SelectContent>
                </Select>
                <Button className="bg-amrita-gold hover:bg-amrita-gold/90 text-white">
                  Update
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Activity Timeline Placeholder */}
          <Card className="bg-amrita-cream border-none shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">Activity Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { time: "2026-03-13 14:35", event: "Payment confirmed via Billplz" },
                  { time: "2026-03-13 14:32", event: "Order placed by Tan Wei Ming" },
                ].map((activity, i) => (
                  <div key={i} className="flex gap-3">
                    <div className="relative flex flex-col items-center">
                      <div className="size-2.5 rounded-full bg-amrita-gold" />
                      {i < 1 && <div className="w-px flex-1 bg-border" />}
                    </div>
                    <div className="pb-4">
                      <p className="text-sm">{activity.event}</p>
                      <p className="text-xs text-muted-foreground">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Customer, Shipping, Payment */}
        <div className="space-y-6">
          <Card className="bg-amrita-cream border-none shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">Customer</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p className="font-medium">{MOCK_ORDER.customer.name}</p>
              <p className="text-muted-foreground">{MOCK_ORDER.customer.email}</p>
              <p className="text-muted-foreground">{MOCK_ORDER.customer.phone}</p>
            </CardContent>
          </Card>

          <Card className="bg-amrita-cream border-none shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">Shipping Address</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-1">
              <p>{MOCK_ORDER.shipping.line1}</p>
              {MOCK_ORDER.shipping.line2 && <p>{MOCK_ORDER.shipping.line2}</p>}
              <p>
                {MOCK_ORDER.shipping.postcode} {MOCK_ORDER.shipping.city}
              </p>
              <p>{MOCK_ORDER.shipping.state}</p>
            </CardContent>
          </Card>

          <Card className="bg-amrita-cream border-none shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">Payment</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Method</span>
                <span>{MOCK_ORDER.payment.method}</span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status</span>
                <span className="text-emerald-600 font-medium">{MOCK_ORDER.payment.status}</span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="text-muted-foreground">Reference</span>
                <span className="font-mono text-xs">{MOCK_ORDER.payment.ref}</span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="text-muted-foreground">Paid At</span>
                <span>{MOCK_ORDER.payment.paidAt}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
