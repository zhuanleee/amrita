"use client";

import { Plus, Send, Eye, MousePointerClick } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { KpiCard } from "@/components/admin/kpi-card";
import { cn } from "@/lib/utils";

type CampaignStatus = "draft" | "scheduled" | "sent" | "cancelled";
type CampaignChannel = "email" | "whatsapp" | "sms";

const statusColors: Record<CampaignStatus, string> = {
  draft: "bg-gray-100 text-gray-800 border-gray-200",
  scheduled: "bg-blue-100 text-blue-800 border-blue-200",
  sent: "bg-emerald-100 text-emerald-800 border-emerald-200",
  cancelled: "bg-red-100 text-red-800 border-red-200",
};

const channelLabels: Record<CampaignChannel, string> = {
  email: "Email",
  whatsapp: "WhatsApp",
  sms: "SMS",
};

const MOCK_CAMPAIGNS: {
  id: string;
  name: string;
  channel: CampaignChannel;
  status: CampaignStatus;
  recipients: number;
  sentDate: string | null;
}[] = [
  {
    id: "1",
    name: "March Promo - Buy 3 Free 1",
    channel: "whatsapp",
    status: "sent",
    recipients: 180,
    sentDate: "2026-03-01",
  },
  {
    id: "2",
    name: "New Extra Strong Launch",
    channel: "email",
    status: "scheduled",
    recipients: 234,
    sentDate: null,
  },
  {
    id: "3",
    name: "Hari Raya Special Bundle",
    channel: "sms",
    status: "draft",
    recipients: 0,
    sentDate: null,
  },
];

export default function MarketingPage() {
  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <KpiCard title="Total Sent" value="1,240" icon={Send} />
        <KpiCard title="Open Rate" value="68.5%" change={2.1} changeType="up" icon={Eye} />
        <KpiCard title="Click Rate" value="12.3%" change={-0.5} changeType="down" icon={MousePointerClick} />
      </div>

      {/* Campaigns Table */}
      <Card className="bg-amrita-cream border-none shadow-sm">
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle className="text-base">Campaigns</CardTitle>
          <Button className="bg-amrita-gold hover:bg-amrita-gold/90 text-white" size="sm">
            <Plus className="size-4" />
            Create Campaign
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Channel</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-center">Recipients</TableHead>
                <TableHead>Sent Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {MOCK_CAMPAIGNS.map((campaign) => (
                <TableRow key={campaign.id}>
                  <TableCell className="font-medium">{campaign.name}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{channelLabels[campaign.channel]}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={cn(statusColors[campaign.status])}
                    >
                      {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">{campaign.recipients}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {campaign.sentDate ?? "-"}
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
