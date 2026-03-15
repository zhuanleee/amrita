"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import type { CustomerSummary } from "@/lib/types";

type RfmSegment = "Champion" | "Loyal" | "At Risk" | "New" | "Potential";

const segmentColors: Record<RfmSegment, string> = {
  Champion: "bg-emerald-100 text-emerald-800 border-emerald-200",
  Loyal: "bg-blue-100 text-blue-800 border-blue-200",
  "At Risk": "bg-amber-100 text-amber-800 border-amber-200",
  New: "bg-purple-100 text-purple-800 border-purple-200",
  Potential: "bg-cyan-100 text-cyan-800 border-cyan-200",
};

function computeSegment(customer: CustomerSummary): RfmSegment {
  const { order_count, lifetime_value, last_order_at } = customer;

  if (order_count === 0) return "New";

  // Days since last order
  const daysSinceLast = last_order_at
    ? Math.floor(
        (Date.now() - new Date(last_order_at).getTime()) / (1000 * 60 * 60 * 24)
      )
    : 999;

  if (order_count >= 5 && lifetime_value >= 500 && daysSinceLast <= 60) return "Champion";
  if (order_count >= 3 && daysSinceLast <= 90) return "Loyal";
  if (daysSinceLast > 90) return "At Risk";
  if (order_count === 1) return "New";
  return "Potential";
}

interface CustomerRow {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  order_count: number;
  lifetime_value: number;
  last_order_at: string | null;
  segment: RfmSegment;
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<CustomerRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [segmentFilter, setSegmentFilter] = useState("all");

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("customer_summary")
      .select("*")
      .then(({ data }) => {
        const rows: CustomerRow[] = (data ?? []).map((c: CustomerSummary) => ({
          id: c.id,
          name: c.name,
          email: c.email,
          phone: c.phone,
          order_count: c.order_count,
          lifetime_value: c.lifetime_value,
          last_order_at: c.last_order_at,
          segment: computeSegment(c),
        }));
        setCustomers(rows);
        setLoading(false);
      });
  }, []);

  const filtered = customers.filter((c) => {
    const matchesSearch =
      search === "" ||
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      (c.email ?? "").toLowerCase().includes(search.toLowerCase());
    const matchesSegment =
      segmentFilter === "all" || c.segment === segmentFilter;
    return matchesSearch && matchesSegment;
  });

  return (
    <div className="space-y-4">
      {/* Search */}
      <Card className="bg-amrita-cream border-none shadow-sm">
        <CardContent className="pt-4 pb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </CardContent>
      </Card>

      {/* Segment Tabs */}
      <Tabs value={segmentFilter} onValueChange={setSegmentFilter}>
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="Champion">Champions</TabsTrigger>
          <TabsTrigger value="Loyal">Loyal</TabsTrigger>
          <TabsTrigger value="At Risk">At Risk</TabsTrigger>
          <TabsTrigger value="New">New</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Table */}
      <Card className="bg-amrita-cream border-none shadow-sm">
        <CardContent className="pt-4">
          {loading ? (
            <div className="py-8 text-center text-muted-foreground">Loading customers...</div>
          ) : filtered.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              {customers.length === 0 ? "No customers yet" : "No customers match your filters"}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead className="hidden md:table-cell">Email</TableHead>
                  <TableHead className="hidden lg:table-cell">Phone</TableHead>
                  <TableHead className="text-center">Orders</TableHead>
                  <TableHead className="text-right">LTV</TableHead>
                  <TableHead className="hidden sm:table-cell">Last Order</TableHead>
                  <TableHead>Segment</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((customer) => (
                  <TableRow key={customer.id} className="cursor-pointer">
                    <TableCell>
                      <Link
                        href={`/admin/customers/${customer.id}`}
                        className="font-medium text-amrita-gold hover:underline"
                      >
                        {customer.name}
                      </Link>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground">
                      {customer.email ?? "-"}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-muted-foreground">
                      {customer.phone ?? "-"}
                    </TableCell>
                    <TableCell className="text-center">{customer.order_count}</TableCell>
                    <TableCell className="text-right">{formatMYR(customer.lifetime_value)}</TableCell>
                    <TableCell className="hidden sm:table-cell text-muted-foreground">
                      {customer.last_order_at
                        ? new Date(customer.last_order_at).toLocaleDateString("en-MY")
                        : "-"}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={cn(segmentColors[customer.segment])}
                      >
                        {customer.segment}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          <div className="flex items-center justify-between pt-4 border-t mt-4">
            <p className="text-sm text-muted-foreground">
              {filtered.length} customers
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled>Previous</Button>
              <Button variant="outline" size="sm" disabled>Next</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
