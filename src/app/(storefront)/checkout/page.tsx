"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, CreditCard, Wallet, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useCart } from "@/lib/cart";
import { formatMYR } from "@/lib/currency";
import { getShippingFee } from "@/lib/shipping";
import { MALAYSIAN_STATES, type MalaysianState } from "@/lib/types";
import { cn } from "@/lib/utils";

const PAYMENT_METHODS = [
  { id: "fpx", label: "FPX (Online Banking)", icon: CreditCard, description: "Pay via your bank" },
  { id: "tng", label: "Touch 'n Go eWallet", icon: Wallet, description: "Pay with TNG eWallet" },
  { id: "grabpay", label: "GrabPay", icon: Smartphone, description: "Pay with GrabPay" },
] as const;

export default function CheckoutPage() {
  const { items, subtotal, itemCount } = useCart();
  const [shippingState, setShippingState] = useState<MalaysianState>("Kuala Lumpur");
  const [paymentMethod, setPaymentMethod] = useState("fpx");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const shippingFee = getShippingFee(shippingState, subtotal);
  const total = subtotal + shippingFee;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Payment integration will be connected later
    await new Promise((r) => setTimeout(r, 1000));
    toast.info("Payment integration coming soon! Your order has been noted.");
    setIsSubmitting(false);
  };

  if (items.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 px-4">
        <h1 className="text-2xl font-[family-name:var(--font-eb-garamond)] text-gold">
          Your cart is empty
        </h1>
        <Button asChild className="bg-amrita-gold hover:bg-amrita-gold/90 text-white">
          <Link href="/products">Continue Shopping</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <Link
        href="/cart"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Cart
      </Link>

      <h1 className="text-3xl font-[family-name:var(--font-eb-garamond)] text-gold mb-8">
        Checkout
      </h1>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-2 space-y-8">
            {/* Contact */}
            <Card className="p-6 bg-card">
              <h2 className="text-lg font-medium mb-4">Contact Information</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Full Name *</Label>
                  <Input id="name" name="name" required placeholder="Your full name" className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input id="phone" name="phone" type="tel" required placeholder="012-345 6789" className="mt-1" />
                </div>
                <div className="sm:col-span-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" name="email" type="email" placeholder="your@email.com" className="mt-1" />
                </div>
              </div>
            </Card>

            {/* Shipping */}
            <Card className="p-6 bg-card">
              <h2 className="text-lg font-medium mb-4">Shipping Address</h2>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="address1">Address Line 1 *</Label>
                  <Input id="address1" name="address1" required placeholder="Street address" className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="address2">Address Line 2</Label>
                  <Input id="address2" name="address2" placeholder="Apartment, unit, etc." className="mt-1" />
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="city">City *</Label>
                    <Input id="city" name="city" required placeholder="City" className="mt-1" />
                  </div>
                  <div>
                    <Label htmlFor="postcode">Postcode *</Label>
                    <Input id="postcode" name="postcode" required placeholder="12345" className="mt-1" />
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <Label htmlFor="state">State *</Label>
                    <Select
                      value={shippingState}
                      onValueChange={(v) => setShippingState(v as MalaysianState)}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {MALAYSIAN_STATES.map((s) => (
                          <SelectItem key={s} value={s}>
                            {s}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </Card>

            {/* Payment Method */}
            <Card className="p-6 bg-card">
              <h2 className="text-lg font-medium mb-4">Payment Method</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {PAYMENT_METHODS.map((method) => (
                  <button
                    key={method.id}
                    type="button"
                    onClick={() => setPaymentMethod(method.id)}
                    className={cn(
                      "flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all text-center",
                      paymentMethod === method.id
                        ? "border-amrita-gold bg-amrita-gold/5"
                        : "border-border hover:border-amrita-gold/40"
                    )}
                  >
                    <method.icon className={cn(
                      "w-6 h-6",
                      paymentMethod === method.id ? "text-amrita-gold" : "text-muted-foreground"
                    )} />
                    <span className="text-sm font-medium">{method.label}</span>
                    <span className="text-xs text-muted-foreground">{method.description}</span>
                  </button>
                ))}
              </div>
            </Card>

            {/* Notes */}
            <Card className="p-6 bg-card">
              <h2 className="text-lg font-medium mb-4">Order Notes</h2>
              <Textarea
                name="notes"
                placeholder="Any special instructions for your order..."
                rows={3}
              />
            </Card>
          </div>

          {/* Order Summary */}
          <div>
            <Card className="p-6 bg-card sticky top-24">
              <h2 className="text-lg font-[family-name:var(--font-eb-garamond)] text-gold mb-4">
                Order Summary
              </h2>
              <div className="space-y-3 mb-4">
                {items.map((item) => {
                  const price = item.variant?.price ?? item.product?.price ?? 0;
                  return (
                    <div key={`${item.product_id}-${item.variant_id}`} className="flex justify-between text-sm">
                      <div className="flex-1 min-w-0">
                        <p className="truncate">{item.product?.name_en}</p>
                        {item.variant && (
                          <p className="text-xs text-muted-foreground">{item.variant.name}</p>
                        )}
                        <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                      </div>
                      <span className="ml-4 font-medium">{formatMYR(price * item.quantity)}</span>
                    </div>
                  );
                })}
              </div>
              <Separator className="my-4" />
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal ({itemCount} items)</span>
                  <span>{formatMYR(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping ({shippingState})</span>
                  <span>{shippingFee === 0 ? <span className="text-amrita-teal">Free</span> : formatMYR(shippingFee)}</span>
                </div>
                <Separator />
                <div className="flex justify-between text-base font-semibold pt-1">
                  <span>Total</span>
                  <span>{formatMYR(total)}</span>
                </div>
              </div>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-6 bg-amrita-gold hover:bg-amrita-gold/90 text-white"
              >
                {isSubmitting ? "Processing..." : `Pay ${formatMYR(total)}`}
              </Button>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}
