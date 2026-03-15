import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { OrderStatusUpdater } from "@/components/admin/order-status-updater";

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  // Try fetching by UUID first
  let { data: order } = await supabase
    .from("orders")
    .select("*")
    .eq("id", id)
    .single();

  // If not found, try by order_number
  if (!order) {
    const { data: orderByNumber } = await supabase
      .from("orders")
      .select("*")
      .eq("order_number", id)
      .single();
    order = orderByNumber;
  }

  if (!order) {
    notFound();
  }

  // Fetch order items
  const { data: items } = await supabase
    .from("order_items")
    .select("*")
    .eq("order_id", order.id);

  const orderItems = items ?? [];

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
            <h2 className="text-xl font-semibold">{order.order_number}</h2>
            <p className="text-sm text-muted-foreground">
              {new Date(order.created_at).toLocaleString("en-MY")}
            </p>
          </div>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - Order Items */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-amrita-cream border-none shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">Order Items</CardTitle>
            </CardHeader>
            <CardContent>
              {orderItems.length === 0 ? (
                <div className="py-4 text-center text-muted-foreground">
                  No items found
                </div>
              ) : (
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
                    {orderItems.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.product_name}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {item.variant_name ?? "-"}
                        </TableCell>
                        <TableCell className="text-center">{item.quantity}</TableCell>
                        <TableCell className="text-right">{formatMYR(item.price)}</TableCell>
                        <TableCell className="text-right">{formatMYR(item.line_total)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                  <TableFooter>
                    <TableRow>
                      <TableCell colSpan={4} className="text-right">Subtotal</TableCell>
                      <TableCell className="text-right">{formatMYR(order.subtotal)}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell colSpan={4} className="text-right">Shipping</TableCell>
                      <TableCell className="text-right">{formatMYR(order.shipping_fee)}</TableCell>
                    </TableRow>
                    {order.discount_amount > 0 && (
                      <TableRow>
                        <TableCell colSpan={4} className="text-right">Discount</TableCell>
                        <TableCell className="text-right text-red-600">
                          -{formatMYR(order.discount_amount)}
                        </TableCell>
                      </TableRow>
                    )}
                    <TableRow>
                      <TableCell colSpan={4} className="text-right font-semibold">Total</TableCell>
                      <TableCell className="text-right font-semibold">{formatMYR(order.total)}</TableCell>
                    </TableRow>
                  </TableFooter>
                </Table>
              )}
            </CardContent>
          </Card>

          {/* Status Update */}
          <OrderStatusUpdater orderId={order.id} currentStatus={order.status} />

          {/* Activity Timeline */}
          <Card className="bg-amrita-cream border-none shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">Activity Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.paid_at && (
                  <div className="flex gap-3">
                    <div className="relative flex flex-col items-center">
                      <div className="size-2.5 rounded-full bg-amrita-gold" />
                      <div className="w-px flex-1 bg-border" />
                    </div>
                    <div className="pb-4">
                      <p className="text-sm">
                        Payment confirmed{order.payment_method ? ` via ${order.payment_method}` : ""}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(order.paid_at).toLocaleString("en-MY")}
                      </p>
                    </div>
                  </div>
                )}
                <div className="flex gap-3">
                  <div className="relative flex flex-col items-center">
                    <div className="size-2.5 rounded-full bg-amrita-gold" />
                  </div>
                  <div className="pb-4">
                    <p className="text-sm">Order placed by {order.customer_name}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(order.created_at).toLocaleString("en-MY")}
                    </p>
                  </div>
                </div>
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
              <p className="font-medium">{order.customer_name}</p>
              {order.customer_email && (
                <p className="text-muted-foreground">{order.customer_email}</p>
              )}
              <p className="text-muted-foreground">{order.customer_phone}</p>
            </CardContent>
          </Card>

          <Card className="bg-amrita-cream border-none shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">Shipping Address</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-1">
              <p>{order.shipping_address_line1}</p>
              {order.shipping_address_line2 && <p>{order.shipping_address_line2}</p>}
              <p>
                {order.shipping_postcode} {order.shipping_city}
              </p>
              <p>{order.shipping_state}</p>
            </CardContent>
          </Card>

          <Card className="bg-amrita-cream border-none shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">Payment</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Method</span>
                <span>{order.payment_method ?? "-"}</span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status</span>
                <span className="text-emerald-600 font-medium">{order.payment_status}</span>
              </div>
              {order.payment_ref && (
                <>
                  <Separator />
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Reference</span>
                    <span className="font-mono text-xs">{order.payment_ref}</span>
                  </div>
                </>
              )}
              {order.paid_at && (
                <>
                  <Separator />
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Paid At</span>
                    <span>{new Date(order.paid_at).toLocaleString("en-MY")}</span>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
