"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Package, Loader2, User, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/client";
import { formatMYR } from "@/lib/currency";
import type { User as SupabaseUser } from "@supabase/supabase-js";

interface Order {
  id: string;
  order_number: string;
  created_at: string;
  total: number;
  status: string;
  order_items: { id: string }[];
}

const STATUS_COLORS: Record<string, string> = {
  pending_payment: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-blue-100 text-blue-800",
  processing: "bg-blue-100 text-blue-800",
  shipped: "bg-purple-100 text-purple-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
  refunded: "bg-gray-100 text-gray-800",
};

function formatStatus(status: string): string {
  return status
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-MY", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function OrderHistoryPage() {
  const supabase = createClient();
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadOrders = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }
      setUser(user);

      // Find customer by auth_user_id
      const { data: customer } = await supabase
        .from("customers")
        .select("id")
        .eq("auth_user_id", user.id)
        .single();

      if (customer) {
        const { data: orderData } = await supabase
          .from("orders")
          .select("id, order_number, created_at, total, status, order_items(id)")
          .eq("customer_id", customer.id)
          .order("created_at", { ascending: false });

        setOrders(orderData || []);
      }

      setLoading(false);
    };

    loadOrders();
  }, []);

  const handleSignIn = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin + "/auth/callback?next=/account/orders",
      },
    });
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 px-4">
        <User className="size-12 text-muted-foreground" />
        <h1 className="text-2xl font-[family-name:var(--font-eb-garamond)] text-gold">
          Sign in to view orders
        </h1>
        <p className="text-sm text-muted-foreground text-center max-w-md">
          Sign in with Google to view your order history and track your deliveries.
        </p>
        <Button
          onClick={handleSignIn}
          className="bg-amrita-gold hover:bg-amrita-gold/90 text-white"
        >
          Sign In with Google
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-[family-name:var(--font-eb-garamond)] text-gold mb-8">
        My Orders
      </h1>

      {orders.length === 0 ? (
        <Card className="p-8 bg-card text-center">
          <Package className="size-12 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-lg font-medium mb-2">No orders yet</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Start shopping and your orders will appear here.
          </p>
          <Button asChild className="bg-amrita-gold hover:bg-amrita-gold/90 text-white">
            <Link href="/products">Browse Products</Link>
          </Button>
        </Card>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <Link key={order.id} href={`/order/${order.id}`}>
              <Card className="p-4 bg-card hover:bg-muted/30 transition-colors cursor-pointer">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="text-sm font-semibold">
                        {order.order_number}
                      </span>
                      <Badge
                        className={
                          STATUS_COLORS[order.status] ||
                          "bg-gray-100 text-gray-800"
                        }
                      >
                        {formatStatus(order.status)}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>{formatDate(order.created_at)}</span>
                      <span>
                        {order.order_items?.length || 0}{" "}
                        {(order.order_items?.length || 0) === 1 ? "item" : "items"}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold">
                      {formatMYR(order.total)}
                    </span>
                    <ChevronRight className="size-4 text-muted-foreground" />
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
