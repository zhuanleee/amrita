"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ORDER_STATUS_LABELS, type OrderStatus } from "@/lib/types";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

interface OrderStatusUpdaterProps {
  orderId: string;
  currentStatus: OrderStatus;
}

export function OrderStatusUpdater({ orderId, currentStatus }: OrderStatusUpdaterProps) {
  const [status, setStatus] = useState<string>(currentStatus);
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  const handleUpdate = async () => {
    setSaving(true);
    const supabase = createClient();
    await supabase
      .from("orders")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", orderId);
    setSaving(false);
    router.refresh();
  };

  return (
    <Card className="bg-amrita-cream border-none shadow-sm">
      <CardHeader>
        <CardTitle className="text-base">Update Status</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-3">
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-[200px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(Object.entries(ORDER_STATUS_LABELS) as [OrderStatus, string][]).map(
                ([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                )
              )}
            </SelectContent>
          </Select>
          <Button
            className="bg-amrita-gold hover:bg-amrita-gold/90 text-white"
            onClick={handleUpdate}
            disabled={saving || status === currentStatus}
          >
            {saving ? "Updating..." : "Update"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
