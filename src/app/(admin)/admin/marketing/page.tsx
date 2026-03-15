"use client";

import { useState, useEffect, useCallback } from "react";
import {
  ShoppingBag,
  DollarSign,
  BarChart3,
  Copy,
  Check,
  Megaphone,
  Globe,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
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
import { formatMYR } from "@/lib/currency";

// ─── Types ───────────────────────────────────────────────────────

interface OrderRow {
  id: string;
  total: number;
  source: string | null;
  status: string;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

interface ChannelStats {
  label: string;
  key: string;
  orders: number;
  revenue: number;
  aov: number;
  color: string;
}

interface CampaignRow {
  campaign: string;
  source: string;
  medium: string;
  orders: number;
  revenue: number;
  aov: number;
  firstOrder: string;
  lastOrder: string;
}

interface ContentRow {
  content: string;
  source: string;
  orders: number;
  revenue: number;
}

interface TimeSeriesPoint {
  date: string;
  [key: string]: string | number;
}

// ─── Constants ───────────────────────────────────────────────────

const CHANNEL_COLORS: Record<string, string> = {
  facebook: "#1877F2",
  instagram: "#E4405F",
  xiaohongshu: "#FF2442",
  web: "#2eb89a",
  other: "#8a7a5a",
};

const CHANNEL_LABELS: Record<string, string> = {
  facebook: "Facebook",
  instagram: "Instagram",
  xiaohongshu: "Xiaohongshu",
  web: "Organic / Web",
  other: "Other",
};

const TOOLTIP_STYLE = {
  backgroundColor: "#f5f1ea",
  border: "1px solid #d5cfc6",
  borderRadius: "8px",
};

const STORE_URL = "https://amrita-pink.vercel.app/products";

const UTM_EXAMPLES = [
  {
    platform: "Facebook",
    color: CHANNEL_COLORS.facebook,
    url: `${STORE_URL}?utm_source=facebook&utm_medium=paid&utm_campaign=your_campaign`,
  },
  {
    platform: "Instagram",
    color: CHANNEL_COLORS.instagram,
    url: `${STORE_URL}?utm_source=instagram&utm_medium=social&utm_campaign=your_campaign`,
  },
  {
    platform: "Xiaohongshu",
    color: CHANNEL_COLORS.xiaohongshu,
    url: `${STORE_URL}?utm_source=xiaohongshu&utm_medium=post&utm_campaign=your_campaign`,
  },
];

// ─── Helpers ─────────────────────────────────────────────────────

function normaliseSource(raw: string | null | undefined): string {
  if (!raw) return "web";
  const s = raw.toLowerCase().trim();
  if (s === "web" || s === "organic" || s === "direct" || s === "") return "web";
  if (["facebook", "fb"].includes(s)) return "facebook";
  if (["instagram", "ig"].includes(s)) return "instagram";
  if (["xiaohongshu", "red", "xhs"].includes(s)) return "xiaohongshu";
  if (Object.keys(CHANNEL_COLORS).includes(s)) return s;
  return "other";
}

function getUtm(meta: Record<string, unknown> | null): {
  source: string;
  medium: string;
  campaign: string;
  content: string;
} {
  const empty = { source: "", medium: "", campaign: "", content: "" };
  if (!meta) return empty;
  const utm = meta.utm as Record<string, string> | undefined;
  if (!utm) return empty;
  return {
    source: utm.source ?? "",
    medium: utm.medium ?? "",
    campaign: utm.campaign ?? "",
    content: utm.content ?? "",
  };
}

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-MY", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function fmtShortDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-MY", {
    month: "short",
    day: "numeric",
  });
}

// ─── Copyable Link Component ────────────────────────────────────

function CopyableLink({ platform, color, url }: { platform: string; color: string; url: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div
      className="flex items-start gap-3 rounded-lg border p-3 cursor-pointer hover:bg-muted/40 transition-colors"
      onClick={handleCopy}
    >
      <div className="mt-0.5 rounded-full p-1.5" style={{ backgroundColor: `${color}20` }}>
        <Globe className="size-4" style={{ color }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium">{platform}</p>
        <p className="text-xs text-muted-foreground break-all">{url}</p>
      </div>
      <button className="shrink-0 mt-0.5">
        {copied ? (
          <Check className="size-4 text-emerald-500" />
        ) : (
          <Copy className="size-4 text-muted-foreground" />
        )}
      </button>
    </div>
  );
}

// ─── Channel Icon SVGs (inline for simplicity) ──────────────────

function ChannelIcon({ channel }: { channel: string }) {
  const color = CHANNEL_COLORS[channel] ?? CHANNEL_COLORS.other;
  const iconClass = "size-5";

  switch (channel) {
    case "facebook":
      return (
        <svg viewBox="0 0 24 24" className={iconClass} fill={color}>
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      );
    case "instagram":
      return (
        <svg viewBox="0 0 24 24" className={iconClass} fill={color}>
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
        </svg>
      );
    case "xiaohongshu":
      return (
        <svg viewBox="0 0 24 24" className={iconClass} fill={color}>
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15H8v-2h3v2zm5-4H8v-2h8v2zm0-4H8V7h8v2z" />
        </svg>
      );
    default:
      return <Globe className={iconClass} style={{ color }} />;
  }
}

// ─── Main Component ─────────────────────────────────────────────

export default function MarketingPage() {
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("30");

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      const supabase = createClient();
      const { data } = await supabase
        .from("orders")
        .select("id, total, source, status, metadata, created_at")
        .not("status", "in", '("cancelled","refunded")')
        .order("created_at", { ascending: true });
      setOrders((data as OrderRow[]) ?? []);
      setLoading(false);
    };
    fetchOrders();
  }, []);

  // ── Derived data ──

  const buildChannelStats = useCallback((): ChannelStats[] => {
    const map: Record<string, { orders: number; revenue: number }> = {};
    for (const o of orders) {
      const ch = normaliseSource(o.source);
      if (!map[ch]) map[ch] = { orders: 0, revenue: 0 };
      map[ch].orders += 1;
      map[ch].revenue += o.total ?? 0;
    }
    const allChannels = ["facebook", "instagram", "xiaohongshu", "web", "other"];
    return allChannels
      .filter((ch) => map[ch])
      .map((ch) => ({
        key: ch,
        label: CHANNEL_LABELS[ch] ?? ch,
        orders: map[ch].orders,
        revenue: Math.round(map[ch].revenue * 100) / 100,
        aov: map[ch].orders > 0 ? Math.round((map[ch].revenue / map[ch].orders) * 100) / 100 : 0,
        color: CHANNEL_COLORS[ch] ?? CHANNEL_COLORS.other,
      }));
  }, [orders]);

  const buildPieData = useCallback((): { name: string; value: number; color: string }[] => {
    return buildChannelStats()
      .filter((c) => c.revenue > 0)
      .map((c) => ({ name: c.label, value: c.revenue, color: c.color }));
  }, [buildChannelStats]);

  const buildTimeSeries = useCallback((): TimeSeriesPoint[] => {
    if (timeRange === "all") {
      // Group by month for all time
      const buckets: Record<string, Record<string, number>> = {};
      for (const o of orders) {
        const monthKey = o.created_at.slice(0, 7); // YYYY-MM
        if (!buckets[monthKey]) {
          buckets[monthKey] = { facebook: 0, instagram: 0, xiaohongshu: 0, web: 0, other: 0 };
        }
        const ch = normaliseSource(o.source);
        buckets[monthKey][ch] = (buckets[monthKey][ch] ?? 0) + 1;
      }
      return Object.entries(buckets)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([month, channels]) => {
          const [y, m] = month.split("-");
          const label = new Date(Number(y), Number(m) - 1).toLocaleDateString("en-MY", { month: "short", year: "2-digit" });
          return { date: label, ...channels };
        });
    }

    const days = Number(timeRange);
    const now = new Date();
    const startDate = new Date();
    startDate.setDate(now.getDate() - days + 1);
    startDate.setHours(0, 0, 0, 0);

    // Build date buckets
    const buckets: Record<string, Record<string, number>> = {};
    for (let i = 0; i < days; i++) {
      const d = new Date(startDate);
      d.setDate(d.getDate() + i);
      const key = d.toISOString().slice(0, 10);
      buckets[key] = { facebook: 0, instagram: 0, xiaohongshu: 0, web: 0, other: 0 };
    }

    for (const o of orders) {
      const dateKey = o.created_at.slice(0, 10);
      if (buckets[dateKey]) {
        const ch = normaliseSource(o.source);
        buckets[dateKey][ch] = (buckets[dateKey][ch] ?? 0) + 1;
      }
    }

    return Object.entries(buckets).map(([date, channels]) => ({
      date: fmtShortDate(date + "T00:00:00"),
      ...channels,
    }));
  }, [orders, timeRange]);

  const buildCampaignData = useCallback((): CampaignRow[] => {
    const map: Record<
      string,
      { source: string; medium: string; orders: number; revenue: number; first: string; last: string }
    > = {};
    for (const o of orders) {
      const utm = getUtm(o.metadata);
      if (!utm.campaign) continue;
      const key = utm.campaign;
      if (!map[key]) {
        map[key] = {
          source: utm.source,
          medium: utm.medium,
          orders: 0,
          revenue: 0,
          first: o.created_at,
          last: o.created_at,
        };
      }
      map[key].orders += 1;
      map[key].revenue += o.total ?? 0;
      if (o.created_at < map[key].first) map[key].first = o.created_at;
      if (o.created_at > map[key].last) map[key].last = o.created_at;
    }
    return Object.entries(map)
      .map(([campaign, d]) => ({
        campaign,
        source: d.source,
        medium: d.medium,
        orders: d.orders,
        revenue: Math.round(d.revenue * 100) / 100,
        aov: d.orders > 0 ? Math.round((d.revenue / d.orders) * 100) / 100 : 0,
        firstOrder: d.first,
        lastOrder: d.last,
      }))
      .sort((a, b) => b.revenue - a.revenue);
  }, [orders]);

  const buildContentData = useCallback((): ContentRow[] => {
    const map: Record<string, { source: string; orders: number; revenue: number }> = {};
    for (const o of orders) {
      const utm = getUtm(o.metadata);
      if (!utm.content) continue;
      const key = utm.content;
      if (!map[key]) map[key] = { source: utm.source, orders: 0, revenue: 0 };
      map[key].orders += 1;
      map[key].revenue += o.total ?? 0;
    }
    return Object.entries(map)
      .map(([content, d]) => ({
        content,
        source: d.source,
        orders: d.orders,
        revenue: Math.round(d.revenue * 100) / 100,
      }))
      .sort((a, b) => b.revenue - a.revenue);
  }, [orders]);

  const buildFunnelData = useCallback(() => {
    let withUtm = 0;
    let withoutUtm = 0;
    for (const o of orders) {
      const utm = getUtm(o.metadata);
      if (utm.source || utm.campaign) withUtm++;
      else withoutUtm++;
    }
    return { total: orders.length, withUtm, withoutUtm };
  }, [orders]);

  // ── Render ──

  if (loading) {
    return (
      <div className="py-12 text-center text-muted-foreground">Loading marketing analytics...</div>
    );
  }

  const channelStats = buildChannelStats();
  const pieData = buildPieData();
  const timeSeries = buildTimeSeries();
  const campaignData = buildCampaignData();
  const contentData = buildContentData();
  const funnel = buildFunnelData();
  const hasOrders = orders.length > 0;

  // ── Empty state ──
  if (!hasOrders) {
    return (
      <div className="space-y-6">
        <Card className="bg-amrita-cream border-none shadow-sm">
          <CardContent className="py-12">
            <div className="text-center space-y-4">
              <div className="mx-auto w-12 h-12 rounded-full bg-amrita-gold-light/15 flex items-center justify-center">
                <Megaphone className="size-6 text-amrita-gold" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">No marketing data yet</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Share these links to start tracking where your orders come from:
                </p>
              </div>
              <div className="max-w-xl mx-auto space-y-2 text-left mt-6">
                {UTM_EXAMPLES.map((ex) => (
                  <CopyableLink key={ex.platform} {...ex} />
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ── Section 1: Channel Overview KPIs ── */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {channelStats.map((ch) => (
          <Card
            key={ch.key}
            className="bg-amrita-cream border-none shadow-sm overflow-hidden"
          >
            <div className="flex">
              <div className="w-1 shrink-0" style={{ backgroundColor: ch.color }} />
              <CardContent className="pt-4 pb-4 flex-1">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                      <ChannelIcon channel={ch.key} />
                      {ch.label}
                    </p>
                    <p className="text-xl font-semibold tracking-tight">{formatMYR(ch.revenue)}</p>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <ShoppingBag className="size-3" />
                        {ch.orders} orders
                      </span>
                      <span className="flex items-center gap-1">
                        <DollarSign className="size-3" />
                        AOV {formatMYR(ch.aov)}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </div>
          </Card>
        ))}
      </div>

      {/* ── Section 2 & 3: Charts Row ── */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Revenue by Channel Donut */}
        <Card className="bg-amrita-cream border-none shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Revenue by Channel</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              {pieData.length === 0 ? (
                <div className="h-full flex items-center justify-center text-muted-foreground">
                  No revenue data
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      dataKey="value"
                      label={({ name, percent }: { name?: string; percent?: number }) =>
                        `${name ?? ""} ${((percent ?? 0) * 100).toFixed(0)}%`
                      }
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={index} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value) => [formatMYR(Number(value)), "Revenue"]}
                      contentStyle={TOOLTIP_STYLE}
                    />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Orders by Channel Over Time */}
        <Card className="bg-amrita-cream border-none shadow-sm">
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="text-base">Orders by Channel Over Time</CardTitle>
            <Tabs value={timeRange} onValueChange={setTimeRange}>
              <TabsList className="h-8">
                <TabsTrigger value="7" className="text-xs px-2 py-1">
                  7d
                </TabsTrigger>
                <TabsTrigger value="30" className="text-xs px-2 py-1">
                  30d
                </TabsTrigger>
                <TabsTrigger value="90" className="text-xs px-2 py-1">
                  90d
                </TabsTrigger>
                <TabsTrigger value="all" className="text-xs px-2 py-1">
                  All
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={timeSeries}>
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                    interval="preserveStartEnd"
                  />
                  <YAxis
                    tick={{ fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip contentStyle={TOOLTIP_STYLE} />
                  <Legend iconSize={10} wrapperStyle={{ fontSize: 12 }} />
                  <Bar dataKey="facebook" stackId="a" fill={CHANNEL_COLORS.facebook} name="Facebook" />
                  <Bar dataKey="instagram" stackId="a" fill={CHANNEL_COLORS.instagram} name="Instagram" />
                  <Bar
                    dataKey="xiaohongshu"
                    stackId="a"
                    fill={CHANNEL_COLORS.xiaohongshu}
                    name="Xiaohongshu"
                  />
                  <Bar dataKey="web" stackId="a" fill={CHANNEL_COLORS.web} name="Organic" />
                  <Bar
                    dataKey="other"
                    stackId="a"
                    fill={CHANNEL_COLORS.other}
                    name="Other"
                    radius={[2, 2, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Section 4: Campaign Performance ── */}
      <Card className="bg-amrita-cream border-none shadow-sm">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <BarChart3 className="size-4" />
            Campaign Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          {campaignData.length === 0 ? (
            <div className="py-8 text-center space-y-3">
              <p className="text-muted-foreground">No campaign data yet</p>
              <p className="text-xs text-muted-foreground max-w-md mx-auto">
                Add <code className="bg-muted px-1 rounded">utm_campaign</code> parameters to your
                links to track campaign performance.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Campaign</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead>Medium</TableHead>
                    <TableHead className="text-center">Orders</TableHead>
                    <TableHead className="text-right">Revenue</TableHead>
                    <TableHead className="text-right">AOV</TableHead>
                    <TableHead>First Order</TableHead>
                    <TableHead>Last Order</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {campaignData.map((row) => (
                    <TableRow key={row.campaign}>
                      <TableCell className="font-medium">{row.campaign}</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className="text-xs"
                          style={{
                            borderColor: CHANNEL_COLORS[normaliseSource(row.source)] ?? CHANNEL_COLORS.other,
                            color: CHANNEL_COLORS[normaliseSource(row.source)] ?? CHANNEL_COLORS.other,
                          }}
                        >
                          {row.source || "-"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">{row.medium || "-"}</TableCell>
                      <TableCell className="text-center">{row.orders}</TableCell>
                      <TableCell className="text-right font-medium">{formatMYR(row.revenue)}</TableCell>
                      <TableCell className="text-right text-muted-foreground">
                        {formatMYR(row.aov)}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {fmtDate(row.firstOrder)}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {fmtDate(row.lastOrder)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Section 5: Top Performing Content ── */}
      <Card className="bg-amrita-cream border-none shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Top Performing Content</CardTitle>
        </CardHeader>
        <CardContent>
          {contentData.length === 0 ? (
            <div className="py-8 text-center space-y-3">
              <p className="text-muted-foreground">No content tracking data yet</p>
              <p className="text-xs text-muted-foreground max-w-md mx-auto">
                Add <code className="bg-muted px-1 rounded">utm_content</code> to identify which
                specific ad or post drives orders.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Content ID</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead className="text-center">Orders</TableHead>
                  <TableHead className="text-right">Revenue</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {contentData.map((row) => (
                  <TableRow key={row.content}>
                    <TableCell className="font-medium">{row.content}</TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className="text-xs"
                        style={{
                          borderColor: CHANNEL_COLORS[normaliseSource(row.source)] ?? CHANNEL_COLORS.other,
                          color: CHANNEL_COLORS[normaliseSource(row.source)] ?? CHANNEL_COLORS.other,
                        }}
                      >
                        {row.source || "-"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">{row.orders}</TableCell>
                    <TableCell className="text-right font-medium">{formatMYR(row.revenue)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* ── Section 6: Conversion Funnel ── */}
      <Card className="bg-amrita-cream border-none shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Attribution Funnel</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Visitor placeholder */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Site Visitors</span>
              <span className="text-xs italic text-muted-foreground">
                Connect Google Analytics for visitor data
              </span>
            </div>
            <div className="h-8 rounded-md bg-muted/40 border border-dashed border-muted-foreground/20 flex items-center justify-center">
              <span className="text-xs text-muted-foreground">--</span>
            </div>
          </div>

          {/* Attributed orders */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span>Orders with UTM (attributed)</span>
              <span className="font-medium">{funnel.withUtm}</span>
            </div>
            <div className="h-8 rounded-md overflow-hidden bg-muted/20">
              <div
                className="h-full rounded-md flex items-center px-3"
                style={{
                  width: funnel.total > 0 ? `${Math.max((funnel.withUtm / funnel.total) * 100, 4)}%` : "4%",
                  backgroundColor: CHANNEL_COLORS.facebook,
                }}
              >
                {funnel.total > 0 && (
                  <span className="text-xs text-white font-medium">
                    {Math.round((funnel.withUtm / funnel.total) * 100)}%
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Direct / organic orders */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span>Orders without UTM (organic / direct)</span>
              <span className="font-medium">{funnel.withoutUtm}</span>
            </div>
            <div className="h-8 rounded-md overflow-hidden bg-muted/20">
              <div
                className="h-full rounded-md flex items-center px-3"
                style={{
                  width:
                    funnel.total > 0
                      ? `${Math.max((funnel.withoutUtm / funnel.total) * 100, 4)}%`
                      : "4%",
                  backgroundColor: CHANNEL_COLORS.web,
                }}
              >
                {funnel.total > 0 && (
                  <span className="text-xs text-white font-medium">
                    {Math.round((funnel.withoutUtm / funnel.total) * 100)}%
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Total */}
          <div className="pt-2 border-t flex items-center justify-between text-sm">
            <span className="font-medium">Total Orders</span>
            <span className="font-semibold">{funnel.total}</span>
          </div>
        </CardContent>
      </Card>

      {/* ── UTM Links Reference ── */}
      <Card className="bg-amrita-cream border-none shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">UTM Tracking Links</CardTitle>
          <p className="text-xs text-muted-foreground">Click to copy. Share these on each platform.</p>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 sm:grid-cols-3">
            {UTM_EXAMPLES.map((ex) => (
              <CopyableLink key={ex.platform} {...ex} />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
