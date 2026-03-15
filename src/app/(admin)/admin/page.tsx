import { DollarSign, ShoppingCart, Clock, TrendingUp, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { KpiCard } from "@/components/admin/kpi-card";
import { RevenueChart, RecentOrdersTable } from "@/components/admin/dashboard-charts";
import { formatMYR } from "@/lib/currency";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const supabase = await createClient();

  // Today's date boundaries (Malaysia timezone)
  const today = new Date();
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString();

  // Fetch today's orders (excluding cancelled/refunded)
  const { data: todayOrders } = await supabase
    .from("orders")
    .select("total")
    .gte("created_at", todayStart)
    .not("status", "in", '("cancelled","refunded")');

  const todayRevenue = (todayOrders ?? []).reduce((sum, o) => sum + (o.total ?? 0), 0);
  const todayOrderCount = (todayOrders ?? []).length;

  // Fetch pending orders count
  const { count: pendingCount } = await supabase
    .from("orders")
    .select("id", { count: "exact", head: true })
    .eq("status", "pending_payment");

  // Fetch total customers count
  const { count: customerCount } = await supabase
    .from("customers")
    .select("id", { count: "exact", head: true });

  // Fetch all non-cancelled orders for AVG calculation
  const { data: allOrders } = await supabase
    .from("orders")
    .select("total")
    .not("status", "in", '("cancelled","refunded")');

  const avgOrderValue =
    allOrders && allOrders.length > 0
      ? allOrders.reduce((sum, o) => sum + (o.total ?? 0), 0) / allOrders.length
      : 0;

  // Fetch revenue chart data - last 30 days from orders
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 29);
  const thirtyDaysStart = new Date(
    thirtyDaysAgo.getFullYear(),
    thirtyDaysAgo.getMonth(),
    thirtyDaysAgo.getDate()
  ).toISOString();

  const { data: recentOrders } = await supabase
    .from("orders")
    .select("total, created_at")
    .gte("created_at", thirtyDaysStart)
    .not("status", "in", '("cancelled","refunded")')
    .order("created_at");

  // Group orders by date for chart
  const revenueByDate: Record<string, number> = {};
  for (let i = 0; i < 30; i++) {
    const d = new Date();
    d.setDate(d.getDate() - 29 + i);
    const key = d.toLocaleDateString("en-MY", { month: "short", day: "numeric" });
    revenueByDate[key] = 0;
  }

  (recentOrders ?? []).forEach((order) => {
    const d = new Date(order.created_at);
    const key = d.toLocaleDateString("en-MY", { month: "short", day: "numeric" });
    if (key in revenueByDate) {
      revenueByDate[key] += order.total ?? 0;
    }
  });

  const revenueChartData = Object.entries(revenueByDate).map(([date, revenue]) => ({
    date,
    revenue: Math.round(revenue * 100) / 100,
  }));

  // Fetch recent orders with item counts
  const { data: recentOrdersList } = await supabase
    .from("orders")
    .select("id, order_number, customer_name, total, status, created_at")
    .order("created_at", { ascending: false })
    .limit(5);

  // Get item counts for recent orders
  const recentOrdersWithItems = await Promise.all(
    (recentOrdersList ?? []).map(async (order) => {
      const { data: items } = await supabase
        .from("order_items")
        .select("quantity")
        .eq("order_id", order.id);
      const itemCount = (items ?? []).reduce((sum, item) => sum + item.quantity, 0);
      return { ...order, item_count: itemCount };
    })
  );

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <KpiCard
          title="Today's Revenue"
          value={formatMYR(todayRevenue)}
          icon={DollarSign}
        />
        <KpiCard
          title="Today's Orders"
          value={String(todayOrderCount)}
          icon={ShoppingCart}
        />
        <KpiCard
          title="Pending Orders"
          value={String(pendingCount ?? 0)}
          icon={Clock}
        />
        <KpiCard
          title="Avg Order Value"
          value={formatMYR(avgOrderValue)}
          icon={TrendingUp}
        />
        <KpiCard
          title="Total Customers"
          value={String(customerCount ?? 0)}
          icon={Users}
        />
      </div>

      {/* Revenue Chart */}
      <RevenueChart data={revenueChartData} />

      {/* Recent Orders */}
      <RecentOrdersTable orders={recentOrdersWithItems} />

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3">
        <Button className="bg-amrita-gold hover:bg-amrita-gold/90 text-white">
          Create Order
        </Button>
        <Button variant="outline">
          View Pending
        </Button>
        <Button variant="outline">
          Export Report
        </Button>
      </div>
    </div>
  );
}
