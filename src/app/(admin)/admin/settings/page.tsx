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
  { zone: "Free Shipping (above RM50)", rate: 0 },
];

export default function SettingsPage() {
  const [metaPixelId, setMetaPixelId] = useState("");
  const [metaCAPIToken, setMetaCAPIToken] = useState("");
  const [metaSaving, setMetaSaving] = useState(false);
  const [metaLoading, setMetaLoading] = useState(true);
  const [xhsPixelId, setXhsPixelId] = useState("");
  const [xhsSaving, setXhsSaving] = useState(false);
  const [epApiKey, setEpApiKey] = useState("");
  const [epSandbox, setEpSandbox] = useState(true);
  const [epSaving, setEpSaving] = useState(false);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const res = await fetch("/api/settings");
        if (res.ok) {
          const settings = await res.json();
          setMetaPixelId(settings.meta_pixel_id || "");
          setMetaCAPIToken(settings.meta_capi_token || "");
          setXhsPixelId(settings.xhs_pixel_id || "");
          setEpApiKey(settings.easyparcel_api_key || "");
          setEpSandbox(settings.easyparcel_sandbox !== "false");
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

  const saveXhsSettings = async () => {
    setXhsSaving(true);
    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          xhs_pixel_id: xhsPixelId.trim(),
        }),
      });
      if (res.ok) {
        toast.success("Xiaohongshu tracking settings saved!");
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to save settings");
      }
    } catch {
      toast.error("Failed to save settings");
    }
    setXhsSaving(false);
  };

  const saveEasyParcelSettings = async () => {
    setEpSaving(true);
    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          easyparcel_api_key: epApiKey.trim(),
          easyparcel_sandbox: epSandbox ? "true" : "false",
        }),
      });
      if (res.ok) {
        toast.success("EasyParcel settings saved!");
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to save settings");
      }
    } catch {
      toast.error("Failed to save settings");
    }
    setEpSaving(false);
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

      {/* Xiaohongshu (小红书) Tracking */}
      <Card className="bg-amrita-cream border-none shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Xiaohongshu (小红书) Tracking</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Connect your Xiaohongshu (RED) Pixel to track ad performance and measure conversions from XHS campaigns.
          </p>
          <div className="space-y-2">
            <Label htmlFor="xhs-pixel-id">XHS Pixel ID</Label>
            <Input
              id="xhs-pixel-id"
              placeholder="e.g. xhs_pixel_123456"
              value={metaLoading ? "" : xhsPixelId}
              onChange={(e) => setXhsPixelId(e.target.value)}
              disabled={metaLoading}
            />
            <p className="text-xs text-muted-foreground">
              Find this in your Xiaohongshu Advertiser Platform → Tracking → Pixel Settings
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              onClick={saveXhsSettings}
              disabled={xhsSaving || metaLoading}
              className="bg-amrita-gold hover:bg-amrita-gold/90 text-white"
            >
              {xhsSaving ? "Saving..." : "Save"}
            </Button>
            {xhsPixelId && (
              <span className="text-xs text-amrita-teal font-medium">Connected</span>
            )}
          </div>
          <Separator />
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground">UTM tracking tip:</p>
            <p className="text-xs text-muted-foreground">
              Use <code className="bg-muted px-1 py-0.5 rounded text-[11px]">?utm_source=xiaohongshu&utm_medium=post&utm_campaign=launch</code> in your XHS post links to track campaign performance in the CRM.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* EasyParcel Shipping */}
      <Card className="bg-amrita-cream border-none shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">EasyParcel Shipping</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Connect EasyParcel to get real-time courier rates and auto-generate shipping labels with tracking.
          </p>
          <div className="space-y-2">
            <Label htmlFor="ep-api-key">API Key</Label>
            <Input
              id="ep-api-key"
              type="password"
              placeholder="Paste your EasyParcel API key"
              value={metaLoading ? "" : epApiKey}
              onChange={(e) => setEpApiKey(e.target.value)}
              disabled={metaLoading}
            />
            <p className="text-xs text-muted-foreground">
              Get your API key from EasyParcel Dashboard → Integration → API
            </p>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Sandbox Mode</p>
              <p className="text-xs text-muted-foreground">
                Use demo environment for testing (no real charges)
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={epSandbox}
                onChange={(e) => setEpSandbox(e.target.checked)}
                disabled={metaLoading}
              />
              <div className="w-11 h-6 bg-muted rounded-full peer peer-checked:bg-amrita-teal peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all" />
            </label>
          </div>
          <div className="flex items-center gap-3">
            <Button
              onClick={saveEasyParcelSettings}
              disabled={epSaving || metaLoading}
              className="bg-amrita-gold hover:bg-amrita-gold/90 text-white"
            >
              {epSaving ? "Saving..." : "Save"}
            </Button>
            {epApiKey && (
              <span className="text-xs text-amrita-teal font-medium">Connected</span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Customer Authentication */}
      <Card className="bg-amrita-cream border-none shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Customer Authentication</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex size-8 items-center justify-center rounded-full bg-green-100">
              <span className="text-green-700 text-xs font-bold">G</span>
            </div>
            <div>
              <p className="text-sm font-medium">Google OAuth: Enabled via Supabase Auth</p>
              <p className="text-xs text-muted-foreground">
                Customers can sign in with Google to save their info and view order history.
              </p>
            </div>
          </div>
          <Separator />
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">Setup:</p>
            <ul className="text-xs text-muted-foreground list-disc list-inside space-y-1">
              <li>
                Configure in{" "}
                <a
                  href="https://supabase.com/dashboard/project/sxlibbtmgbbaqsehxwll/auth/providers"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-amrita-teal underline"
                >
                  Supabase Dashboard &rarr; Authentication &rarr; Providers &rarr; Google
                </a>
              </li>
              <li>
                Requires Google Cloud Console OAuth credentials (Client ID + Client Secret)
              </li>
              <li>
                Set authorized redirect URI to:{" "}
                <code className="bg-muted px-1 py-0.5 rounded text-[11px]">
                  https://sxlibbtmgbbaqsehxwll.supabase.co/auth/v1/callback
                </code>
              </li>
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
