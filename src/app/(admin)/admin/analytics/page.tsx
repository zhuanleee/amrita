"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatMYR } from "@/lib/currency";
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { createClient } from "@/lib/supabase/client";

const PIE_COLORS = ["#c8a96e", "#2eb89a", "#6366f1", "#f59e0b", "#ef4444"];

interface RevenuePoint {
  date: string;
  revenue: number;
}

interface ProductMixPoint {
  name: string;
  value: number;
}

interface GeoRow {
  state: string;
  orders: number;
  revenue: number;
}

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState("30");
  const [revenueData, setRevenueData] = useState<RevenuePoint[]>([]);
  const [productMix, setProductMix] = useState<ProductMixPoint[]>([]);
  const [geoData, setGeoData] = useState<GeoRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const days = Number(timeRange);
    const supabase = createClient();

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days + 1);
    startDate.setHours(0, 0, 0, 0);
    const startIso = startDate.toISOString();

    // Fetch orders for the time range
    const fetchData = async () => {
      setLoading(true);

      // Revenue data
      const { data: orders } = await supabase
        .from("orders")
        .select("total, created_at, shipping_state")
        .gte("created_at", startIso)
        .not("status", "in", '("cancelled","refunded")')
        .order("created_at");

      // Group by date for revenue chart
      const byDate: Record<string, number> = {};
      for (let i = 0; i < days; i++) {
        const d = new Date();
        d.setDate(d.getDate() - days + 1 + i);
        const key = d.toLocaleDateString("en-MY", { month: "short", day: "numeric" });
        byDate[key] = 0;
      }
      (orders ?? []).forEach((o) => {
        const d = new Date(o.created_at);
        const key = d.toLocaleDateString("en-MY", { month: "short", day: "numeric" });
        if (key in byDate) byDate[key] += o.total ?? 0;
      });
      setRevenueData(
        Object.entries(byDate).map(([date, revenue]) => ({
          date,
          revenue: Math.round(revenue * 100) / 100,
        }))
      );

      // Geographic data
      const geoMap: Record<string, { orders: number; revenue: number }> = {};
      (orders ?? []).forEach((o) => {
        const state = o.shipping_state || "Unknown";
        if (!geoMap[state]) geoMap[state] = { orders: 0, revenue: 0 };
        geoMap[state].orders += 1;
        geoMap[state].revenue += o.total ?? 0;
      });
      setGeoData(
        Object.entries(geoMap)
          .map(([state, data]) => ({ state, ...data }))
          .sort((a, b) => b.orders - a.orders)
      );

      // Product mix from order_items
      const { data: items } = await supabase
        .from("order_items")
        .select("product_name, quantity, line_total, order_id");

      // We need to filter items by orders in range - join via order_id
      const orderIds = new Set((orders ?? []).map((o) => {
        // We need order IDs - refetch with id
        return "";
      }));

      // Simpler approach: fetch order IDs separately
      const { data: orderIdsData } = await supabase
        .from("orders")
        .select("id")
        .gte("created_at", startIso)
        .not("status", "in", '("cancelled","refunded")');

      const validIds = new Set((orderIdsData ?? []).map((o) => o.id));

      const productMap: Record<string, number> = {};
      (items ?? []).forEach((item) => {
        if (validIds.has(item.order_id)) {
          productMap[item.product_name] = (productMap[item.product_name] ?? 0) + item.quantity;
        }
      });
      setProductMix(
        Object.entries(productMap)
          .map(([name, value]) => ({ name, value }))
          .sort((a, b) => b.value - a.value)
      );

      setLoading(false);
    };

    fetchData();
  }, [timeRange]);

  const maxOrders = geoData.length > 0 ? Math.max(...geoData.map((d) => d.orders)) : 1;
  const hasData = revenueData.some((d) => d.revenue > 0);

  return (
    <div className="space-y-6">
      {/* Time Range Tabs */}
      <Tabs value={timeRange} onValueChange={setTimeRange}>
        <TabsList>
          <TabsTrigger value="7">7 Days</TabsTrigger>
          <TabsTrigger value="30">30 Days</TabsTrigger>
          <TabsTrigger value="90">90 Days</TabsTrigger>
        </TabsList>
      </Tabs>

      {loading ? (
        <div className="py-12 text-center text-muted-foreground">Loading analytics...</div>
      ) : (
        <>
          {/* Revenue Trend */}
          <Card className="bg-amrita-cream border-none shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">Revenue Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                {!hasData ? (
                  <div className="h-full flex items-center justify-center text-muted-foreground">
                    No revenue data yet
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={revenueData}>
                      <XAxis dataKey="date" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                      <YAxis tick={{ fontSize: 12 }} tickLine={false} axisLine={false} tickFormatter={(v) => `RM ${v}`} />
                      <Tooltip
                        formatter={(value) => [formatMYR(Number(value)), "Revenue"]}
                        contentStyle={{ backgroundColor: "#f5f1ea", border: "1px solid #d5cfc6", borderRadius: "8px" }}
                      />
                      <Line type="monotone" dataKey="revenue" stroke="#c8a96e" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Product Mix */}
            <Card className="bg-amrita-cream border-none shadow-sm">
              <CardHeader>
                <CardTitle className="text-base">Product Mix</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[280px]">
                  {productMix.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-muted-foreground">
                      No data yet
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={productMix}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={100}
                          dataKey="value"
                          label={({ name, percent }: { name?: string; percent?: number }) =>
                            `${name ?? ""} ${((percent ?? 0) * 100).toFixed(0)}%`
                          }
                        >
                          {productMix.map((_, index) => (
                            <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value) => [`${Number(value)} units`, "Quantity"]}
                          contentStyle={{ backgroundColor: "#f5f1ea", border: "1px solid #d5cfc6", borderRadius: "8px" }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Placeholder for customer acquisition - requires more data */}
            <Card className="bg-amrita-cream border-none shadow-sm">
              <CardHeader>
                <CardTitle className="text-base">Customer Acquisition</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[280px] flex items-center justify-center text-muted-foreground">
                  No data yet
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Geographic Distribution */}
          <Card className="bg-amrita-cream border-none shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">Geographic Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              {geoData.length === 0 ? (
                <div className="py-8 text-center text-muted-foreground">No data yet</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>State</TableHead>
                      <TableHead className="text-center">Orders</TableHead>
                      <TableHead className="text-right">Revenue</TableHead>
                      <TableHead className="hidden sm:table-cell w-[200px]">Distribution</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {geoData.map((row) => (
                      <TableRow key={row.state}>
                        <TableCell className="font-medium">{row.state}</TableCell>
                        <TableCell className="text-center">{row.orders}</TableCell>
                        <TableCell className="text-right">{formatMYR(row.revenue)}</TableCell>
                        <TableCell className="hidden sm:table-cell">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                              <div
                                className="h-full rounded-full bg-amrita-gold-light"
                                style={{ width: `${(row.orders / maxOrders) * 100}%` }}
                              />
                            </div>
                            <span className="text-xs text-muted-foreground w-8 text-right">
                              {Math.round((row.orders / maxOrders) * 100)}%
                            </span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
