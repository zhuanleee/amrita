import Link from "next/link";
import { CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { createClient } from "@/lib/supabase/server";
import { formatMYR } from "@/lib/currency";

export default async function OrderConfirmationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: order } = await supabase
    .from("orders")
    .select("*, order_items(*)")
    .eq("id", id)
    .single();

  if (!order) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4 py-12">
        <Card className="max-w-md w-full p-8 bg-card text-center">
          <h1 className="text-2xl font-[family-name:var(--font-eb-garamond)] text-gold mb-2">
            Order Not Found
          </h1>
          <p className="text-muted-foreground mb-6">
            We couldn&apos;t find an order with that ID.
          </p>
          <Button asChild className="w-full bg-amrita-gold hover:bg-amrita-gold/90 text-white">
            <Link href="/products">Continue Shopping</Link>
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 py-12">
      <Card className="max-w-md w-full p-8 bg-card text-center">
        <CheckCircle className="w-16 h-16 text-amrita-teal mx-auto mb-4" />
        <h1 className="text-2xl font-[family-name:var(--font-eb-garamond)] text-gold mb-2">
          Thank You!
        </h1>
        <p className="text-muted-foreground mb-4">
          Your order has been placed successfully.
        </p>
        <div className="bg-muted/50 rounded-lg p-4 mb-6">
          <p className="text-sm text-muted-foreground">Order Number</p>
          <p className="text-lg font-mono font-semibold">{order.order_number}</p>
        </div>

        {/* Order items */}
        {order.order_items && order.order_items.length > 0 && (
          <div className="text-left mb-4">
            <div className="space-y-2">
              {order.order_items.map((item: { id: string; product_name: string; variant_name: string | null; quantity: number; line_total: number }) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <div>
                    <span>{item.product_name}</span>
                    {item.variant_name && (
                      <span className="text-muted-foreground"> ({item.variant_name})</span>
                    )}
                    <span className="text-muted-foreground"> x{item.quantity}</span>
                  </div>
                  <span>{formatMYR(item.line_total)}</span>
                </div>
              ))}
            </div>
            <Separator className="my-3" />
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatMYR(order.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span>{order.shipping_fee === 0 ? "Free" : formatMYR(order.shipping_fee)}</span>
              </div>
              <Separator className="my-1" />
              <div className="flex justify-between font-semibold">
                <span>Total</span>
                <span>{formatMYR(order.total)}</span>
              </div>
            </div>
          </div>
        )}

        <p className="text-sm text-muted-foreground mb-6">
          We&apos;ll send you an update once your order has been confirmed and shipped.
        </p>
        <Button asChild className="w-full bg-amrita-gold hover:bg-amrita-gold/90 text-white">
          <Link href="/products">Continue Shopping</Link>
        </Button>
      </Card>
    </div>
  );
}
