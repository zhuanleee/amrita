"use client";

import { useState } from "react";
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
import { MALAYSIAN_STATES } from "@/lib/types";
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

// Mock revenue data
function generateRevenueData(days: number) {
  return Array.from({ length: days }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - days + 1 + i);
    return {
      date: date.toLocaleDateString("en-MY", { month: "short", day: "numeric" }),
      revenue: Math.round((600 + Math.random() * 1000) * 100) / 100,
    };
  });
}

const productMixData = [
  { name: "Herbal Mint Original", value: 62 },
  { name: "Herbal Mint Extra Strong", value: 38 },
];

const PIE_COLORS = ["#c8a96e", "#2eb89a"];

const customerAcquisitionData = [
  { month: "Oct", new: 18, returning: 42 },
  { month: "Nov", new: 24, returning: 48 },
  { month: "Dec", new: 35, returning: 55 },
  { month: "Jan", new: 22, returning: 60 },
  { month: "Feb", new: 28, returning: 65 },
  { month: "Mar", new: 19, returning: 58 },
];

// Mock geographic data - a subset of states with orders
const geoData = [
  { state: "Selangor", orders: 85, revenue: 4250.00 },
  { state: "Kuala Lumpur", orders: 62, revenue: 3100.00 },
  { state: "Penang", orders: 38, revenue: 1900.00 },
  { state: "Johor", orders: 31, revenue: 1550.00 },
  { state: "Perak", orders: 18, revenue: 900.00 },
  { state: "Sarawak", orders: 12, revenue: 600.00 },
  { state: "Sabah", orders: 9, revenue: 450.00 },
  { state: "Melaka", orders: 8, revenue: 400.00 },
  { state: "Pahang", orders: 5, revenue: 250.00 },
  { state: "Kedah", orders: 4, revenue: 200.00 },
];

const maxOrders = Math.max(...geoData.map((d) => d.orders));

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState("30");

  const revenueData = generateRevenueData(Number(timeRange));

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

      {/* Revenue Trend */}
      <Card className="bg-amrita-cream border-none shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Revenue Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
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
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={productMixData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    dataKey="value"
                    label={({ name, percent }: { name?: string; percent?: number }) => `${name ?? ""} ${((percent ?? 0) * 100).toFixed(0)}%`}
                  >
                    {productMixData.map((_, index) => (
                      <Cell key={index} fill={PIE_COLORS[index]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => [`${Number(value)}%`, "Share"]}
                    contentStyle={{ backgroundColor: "#f5f1ea", border: "1px solid #d5cfc6", borderRadius: "8px" }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Customer Acquisition */}
        <Card className="bg-amrita-cream border-none shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Customer Acquisition</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={customerAcquisitionData}>
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#f5f1ea", border: "1px solid #d5cfc6", borderRadius: "8px" }}
                  />
                  <Legend />
                  <Bar dataKey="new" name="New Customers" fill="#c8a96e" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="returning" name="Returning" fill="#2eb89a" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
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
        </CardContent>
      </Card>
    </div>
  );
}
