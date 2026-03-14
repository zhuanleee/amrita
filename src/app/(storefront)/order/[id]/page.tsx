import Link from "next/link";
import { CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default async function OrderConfirmationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

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
          <p className="text-lg font-mono font-semibold">{id}</p>
        </div>
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
