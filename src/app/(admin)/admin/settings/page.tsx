"use client";

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

const shippingRates = [
  { zone: "Peninsular Malaysia", rate: 8.00 },
  { zone: "East Malaysia (Sabah & Sarawak)", rate: 15.00 },
  { zone: "Free Shipping (above RM100)", rate: 0 },
];

export default function SettingsPage() {
  return (
    <div className="space-y-6 max-w-3xl">
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
          <div className="pt-4">
            <Button className="bg-amrita-gold hover:bg-amrita-gold/90 text-white">Save</Button>
          </div>
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
              <p className="text-xs text-muted-foreground">
                Receive email alerts for new orders
              </p>
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
              <p className="text-xs text-muted-foreground">
                Send order confirmations via WhatsApp
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-muted rounded-full peer peer-checked:bg-amrita-teal peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all" />
            </label>
          </div>
          <div className="pt-2">
            <Button className="bg-amrita-gold hover:bg-amrita-gold/90 text-white">Save</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
