"use client";

import { useState, useEffect } from "react";
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
import { createClient } from "@/lib/supabase/client";
import type { Campaign } from "@/lib/types";

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

export default function MarketingPage() {
  const [campaignList, setCampaignList] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient();

      const { data: campaigns } = await supabase
        .from("campaigns")
        .select("*")
        .order("created_at", { ascending: false });

      setCampaignList((campaigns as Campaign[]) ?? []);
      setLoading(false);
    };
    fetchData();
  }, []);

  if (loading) {
    return <div className="py-12 text-center text-muted-foreground">Loading...</div>;
  }

  // Compute stats from campaigns
  const sentCampaigns = campaignList.filter((c) => c.status === "sent");
  const totalSent = sentCampaigns.reduce((sum, c) => sum + c.recipient_count, 0);

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <KpiCard title="Total Sent" value={totalSent.toLocaleString()} icon={Send} />
        <KpiCard title="Campaigns" value={String(campaignList.length)} icon={Eye} />
        <KpiCard title="Sent Campaigns" value={String(sentCampaigns.length)} icon={MousePointerClick} />
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
          {campaignList.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              No campaigns yet
            </div>
          ) : (
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
                {campaignList.map((campaign) => (
                  <TableRow key={campaign.id}>
                    <TableCell className="font-medium">{campaign.name}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {channelLabels[campaign.channel as CampaignChannel] ?? campaign.channel}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={cn(statusColors[campaign.status as CampaignStatus] ?? "")}
                      >
                        {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">{campaign.recipient_count}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {campaign.sent_at
                        ? new Date(campaign.sent_at).toLocaleDateString("en-MY")
                        : "-"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
