"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatMYR } from "@/lib/currency";
import { toast } from "sonner";

const shippingRates = [
  { zone: "Klang Valley (KL, Selangor, Putrajaya)", rate: 8.0 },
  { zone: "Peninsular Malaysia", rate: 10.0 },
  { zone: "East Malaysia (Sabah & Sarawak)", rate: 15.0 },
  { zone: "Free Shipping (above RM80)", rate: 0 },
];

export default function SettingsPage() {
  const [metaPixelId, setMetaPixelId] = useState("");
  const [metaCAPIToken, setMetaCAPIToken] = useState("");
  const [metaSaving, setMetaSaving] = useState(false);
  const [metaLoading, setMetaLoading] = useState(true);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const res = await fetch("/api/settings");
        if (res.ok) {
          const settings = await res.json();
          setMetaPixelId(settings.meta_pixel_id || "");
          setMetaCAPIToken(settings.meta_capi_token || "");
        }
      } catch {
        // Settings table might not exist yet
      }
      setMetaLoading(false);
    };
    loadSettings();
  }, []);

  const saveMetaSettings = async () => {
    setMetaSaving(true);
    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          meta_pixel_id: metaPixelId.trim(),
          meta_capi_token: metaCAPIToken.trim(),
        }),
      });
      if (res.ok) {
        toast.success("Meta tracking settings saved!");
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to save settings");
      }
    } catch {
      toast.error("Failed to save settings");
    }
    setMetaSaving(false);
  };

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Meta / Facebook Tracking */}
      <Card className="bg-amrita-cream border-none shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Meta Tracking (Facebook / Instagram)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Connect your Meta Pixel to track ad performance, retarget visitors, and measure ROAS from Facebook & Instagram ads.
          </p>
          <div className="space-y-2">
            <Label htmlFor="meta-pixel-id">Meta Pixel ID</Label>
            <Input
              id="meta-pixel-id"
              placeholder="e.g. 123456789012345"
              value={metaLoading ? "" : metaPixelId}
              onChange={(e) => setMetaPixelId(e.target.value)}
              disabled={metaLoading}
            />
            <p className="text-xs text-muted-foreground">
              Find this in Meta Business Suite → Events Manager → Data Sources
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="meta-capi-token">Conversions API Token</Label>
            <Input
              id="meta-capi-token"
              type="password"
              placeholder="Paste your access token"
              value={metaLoading ? "" : metaCAPIToken}
              onChange={(e) => setMetaCAPIToken(e.target.value)}
              disabled={metaLoading}
            />
            <p className="text-xs text-muted-foreground">
              Events Manager → Settings → Conversions API → Generate access token
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              onClick={saveMetaSettings}
              disabled={metaSaving || metaLoading}
              className="bg-amrita-gold hover:bg-amrita-gold/90 text-white"
            >
              {metaSaving ? "Saving..." : "Save"}
            </Button>
            {metaPixelId && (
              <span className="text-xs text-amrita-teal font-medium">Connected</span>
            )}
          </div>
          <Separator />
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground">Events tracked automatically:</p>
            <ul className="text-xs text-muted-foreground list-disc list-inside space-y-0.5">
              <li>PageView — every page visit</li>
              <li>ViewContent — product page views</li>
              <li>AddToCart — items added to cart</li>
              <li>InitiateCheckout — checkout started</li>
              <li>Purchase — order completed (client + server-side)</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Store Info */}
      <Card className="bg-amrita-cream border-none shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Store Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Store Name</Label>
            <Input defaultValue="AMRITA - Premium Herbal Mint Candy" readOnly />
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <Input defaultValue="Premium sugar-free herbal mint candy from Malaysia" readOnly />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Contact Email</Label>
              <Input defaultValue="hello@amrita.my" readOnly />
            </div>
            <div className="space-y-2">
              <Label>Phone</Label>
              <Input defaultValue="+60 12-345 6789" readOnly />
            </div>
          </div>
          <Button className="bg-amrita-gold hover:bg-amrita-gold/90 text-white">Save</Button>
        </CardContent>
      </Card>

      {/* Shipping Rates */}
      <Card className="bg-amrita-cream border-none shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Shipping Rates</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Zone</TableHead>
                <TableHead className="text-right">Rate</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {shippingRates.map((rate) => (
                <TableRow key={rate.zone}>
                  <TableCell>{rate.zone}</TableCell>
                  <TableCell className="text-right">
                    {rate.rate === 0 ? "Free" : formatMYR(rate.rate)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Payment Gateway */}
      <Card className="bg-amrita-cream border-none shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Payment Gateway (Billplz)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>API Key</Label>
            <Input defaultValue="****-****-****-7a3f" readOnly type="password" />
          </div>
          <div className="space-y-2">
            <Label>Collection ID</Label>
            <Input defaultValue="amr_collection_01" readOnly />
          </div>
          <Button className="bg-amrita-gold hover:bg-amrita-gold/90 text-white">Save</Button>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card className="bg-amrita-cream border-none shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Notifications</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Email Notifications</p>
              <p className="text-xs text-muted-foreground">Receive email alerts for new orders</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-muted rounded-full peer peer-checked:bg-amrita-teal peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all" />
            </label>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">WhatsApp Notifications</p>
              <p className="text-xs text-muted-foreground">Send order confirmations via WhatsApp</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-muted rounded-full peer peer-checked:bg-amrita-teal peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all" />
            </label>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
