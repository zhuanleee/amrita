"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ShoppingCart, DollarSign, TrendingUp, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
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
import { createClient } from "@/lib/supabase/client";

function computeSegment(orderCount: number, ltv: number, daysSinceLast: number) {
  if (orderCount === 0) return "New";
  if (orderCount >= 5 && ltv >= 500 && daysSinceLast <= 60) return "Champion";
  if (orderCount >= 3 && daysSinceLast <= 90) return "Loyal";
  if (daysSinceLast > 90) return "At Risk";
  if (orderCount === 1) return "New";
  return "Potential";
}

const segmentColors: Record<string, string> = {
  Champion: "bg-emerald-100 text-emerald-800 border-emerald-200",
  Loyal: "bg-blue-100 text-blue-800 border-blue-200",
  "At Risk": "bg-amber-100 text-amber-800 border-amber-200",
  New: "bg-purple-100 text-purple-800 border-purple-200",
  Potential: "bg-cyan-100 text-cyan-800 border-cyan-200",
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface CustomerDetailData {
  customer: any;
  customerOrders: any[];
}

export default function CustomerDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const [data, setData] = useState<CustomerDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient();

      // Fetch customer
      const { data: customer } = await supabase
        .from("customers")
        .select("*")
        .eq("id", id)
        .single();

      if (!customer) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      // Fetch their orders
      const { data: orders } = await supabase
        .from("orders")
        .select("*")
        .eq("customer_id", id)
        .order("created_at", { ascending: false });

      setData({ customer, customerOrders: orders ?? [] });
      setLoading(false);
    };
    fetchData();
  }, [id]);

  if (loading) {
    return <div className="py-12 text-center text-muted-foreground">Loading...</div>;
  }

  if (notFound || !data) {
    return (
      <div className="py-12 text-center">
        <h2 className="text-xl font-semibold mb-2">Customer Not Found</h2>
        <p className="text-muted-foreground mb-4">The customer you are looking for does not exist.</p>
        <Link href="/admin/customers">
          <Button variant="outline">Back to Customers</Button>
        </Link>
      </div>
    );
  }

  const { customer, customerOrders } = data;

  // Compute metrics
  const validOrders = customerOrders.filter(
    (o) => o.status !== "cancelled" && o.status !== "refunded"
  );
  const totalOrders = validOrders.length;
  const ltv = validOrders.reduce((sum, o) => sum + (o.total ?? 0), 0);
  const avgOrderValue = totalOrders > 0 ? ltv / totalOrders : 0;

  const lastOrderDate = customerOrders.length > 0 ? new Date(customerOrders[0].created_at) : null;
  const daysSinceLastOrder = lastOrderDate
    ? Math.floor((Date.now() - lastOrderDate.getTime()) / (1000 * 60 * 60 * 24))
    : 999;

  const segment = computeSegment(totalOrders, ltv, daysSinceLastOrder);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Link href="/admin/customers">
            <Button variant="ghost" size="icon-sm">
              <ArrowLeft className="size-4" />
            </Button>
          </Link>
          <div>
            <h2 className="text-xl font-semibold">{customer.name}</h2>
            <p className="text-sm text-muted-foreground">
              {customer.email ?? ""}{customer.email && customer.phone ? " \u00B7 " : ""}{customer.phone ?? ""}
            </p>
            <p className="text-xs text-muted-foreground">
              Member since {new Date(customer.created_at).toLocaleDateString("en-MY")}
            </p>
          </div>
        </div>
        <Badge
          variant="outline"
          className={`${segmentColors[segment] ?? ""} w-fit`}
        >
          {segment}
        </Badge>
      </div>

      {/* KPI Row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard title="Total Orders" value={String(totalOrders)} icon={ShoppingCart} />
        <KpiCard title="Lifetime Value" value={formatMYR(ltv)} icon={DollarSign} />
        <KpiCard title="Avg Order Value" value={formatMYR(avgOrderValue)} icon={TrendingUp} />
        <KpiCard
          title="Days Since Last Order"
          value={lastOrderDate ? String(daysSinceLastOrder) : "-"}
          icon={Clock}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Orders History */}
        <div className="lg:col-span-2">
          <Card className="bg-amrita-cream border-none shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">Order History</CardTitle>
            </CardHeader>
            <CardContent>
              {customerOrders.length === 0 ? (
                <div className="py-4 text-center text-muted-foreground">
                  No orders yet
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order #</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {customerOrders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell>
                          <Link
                            href={`/admin/orders/${order.id}`}
                            className="font-medium text-amrita-gold hover:underline"
                          >
                            {order.order_number}
                          </Link>
                        </TableCell>
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
        </div>

        {/* Notes & Tags */}
        <div className="space-y-6">
          <Card className="bg-amrita-cream border-none shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">Tags</CardTitle>
            </CardHeader>
            <CardContent>
              {customer.tags && customer.tags.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {customer.tags.map((tag: string) => (
                    <Badge key={tag} variant="secondary">{tag}</Badge>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No tags</p>
              )}
            </CardContent>
          </Card>

          <Card className="bg-amrita-cream border-none shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">Notes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Textarea
                defaultValue={customer.notes ?? ""}
                rows={5}
                className="resize-none"
                placeholder="Add notes about this customer..."
              />
              <Button size="sm" className="bg-amrita-gold hover:bg-amrita-gold/90 text-white">
                Save Notes
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
