"use client";

import { useState } from "react";
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

type RfmSegment = "Champion" | "Loyal" | "At Risk" | "New" | "Potential";

const segmentColors: Record<RfmSegment, string> = {
  Champion: "bg-emerald-100 text-emerald-800 border-emerald-200",
  Loyal: "bg-blue-100 text-blue-800 border-blue-200",
  "At Risk": "bg-amber-100 text-amber-800 border-amber-200",
  New: "bg-purple-100 text-purple-800 border-purple-200",
  Potential: "bg-cyan-100 text-cyan-800 border-cyan-200",
};

const MOCK_CUSTOMERS: {
  id: string;
  name: string;
  email: string;
  phone: string;
  orders: number;
  ltv: number;
  lastOrder: string;
  segment: RfmSegment;
}[] = [
  { id: "1", name: "Tan Wei Ming", email: "wm.tan@email.com", phone: "+60 12-345 6789", orders: 12, ltv: 1280.50, lastOrder: "2026-03-14", segment: "Champion" },
  { id: "2", name: "Siti Nurhaliza", email: "siti.n@email.com", phone: "+60 13-456 7890", orders: 8, ltv: 890.00, lastOrder: "2026-03-14", segment: "Loyal" },
  { id: "3", name: "Lim Kok Wai", email: "kokwai@email.com", phone: "+60 11-234 5678", orders: 15, ltv: 2100.00, lastOrder: "2026-03-13", segment: "Champion" },
  { id: "4", name: "Ahmad Faizal", email: "ahmad.f@email.com", phone: "+60 19-876 5432", orders: 1, ltv: 29.90, lastOrder: "2026-03-13", segment: "New" },
  { id: "5", name: "Priya Devi", email: "priya.d@email.com", phone: "+60 16-543 2109", orders: 5, ltv: 420.00, lastOrder: "2026-03-12", segment: "Loyal" },
  { id: "6", name: "Chong Mei Ling", email: "meiling@email.com", phone: "+60 17-654 3210", orders: 3, ltv: 155.80, lastOrder: "2026-01-15", segment: "At Risk" },
  { id: "7", name: "Raj Kumar", email: "raj.k@email.com", phone: "+60 14-765 4321", orders: 2, ltv: 89.80, lastOrder: "2026-03-11", segment: "Potential" },
  { id: "8", name: "Nurul Izzah", email: "nurul.i@email.com", phone: "+60 18-987 6543", orders: 1, ltv: 29.90, lastOrder: "2025-12-20", segment: "At Risk" },
];

export default function CustomersPage() {
  const [search, setSearch] = useState("");
  const [segmentFilter, setSegmentFilter] = useState("all");

  const filtered = MOCK_CUSTOMERS.filter((c) => {
    const matchesSearch =
      search === "" ||
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase());
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
                    {customer.email}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell text-muted-foreground">
                    {customer.phone}
                  </TableCell>
                  <TableCell className="text-center">{customer.orders}</TableCell>
                  <TableCell className="text-right">{formatMYR(customer.ltv)}</TableCell>
                  <TableCell className="hidden sm:table-cell text-muted-foreground">
                    {customer.lastOrder}
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
