"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { User, Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { MALAYSIAN_STATES, type MalaysianState } from "@/lib/types";
import type { User as SupabaseUser } from "@supabase/supabase-js";

interface CustomerRecord {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  address_line1: string | null;
  address_line2: string | null;
  city: string | null;
  postcode: string | null;
  state: string | null;
}

export default function AccountPage() {
  const router = useRouter();
  const supabase = createClient();
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [customer, setCustomer] = useState<CustomerRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form fields
  const [phone, setPhone] = useState("");
  const [addressLine1, setAddressLine1] = useState("");
  const [addressLine2, setAddressLine2] = useState("");
  const [city, setCity] = useState("");
  const [postcode, setPostcode] = useState("");
  const [state, setState] = useState<string>("");

  useEffect(() => {
    const loadUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }
      setUser(user);

      // Fetch customer record
      const { data: customerData } = await supabase
        .from("customers")
        .select("*")
        .eq("auth_user_id", user.id)
        .single();

      if (customerData) {
        setCustomer(customerData);
        setPhone(customerData.phone || "");
        setAddressLine1(customerData.address_line1 || "");
        setAddressLine2(customerData.address_line2 || "");
        setCity(customerData.city || "");
        setPostcode(customerData.postcode || "");
        setState(customerData.state || "");
      }

      setLoading(false);
    };

    loadUser();
  }, []);

  const handleSignIn = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin + "/auth/callback?next=/account",
      },
    });
  };

  const handleSave = async () => {
    if (!user || !customer) return;
    setSaving(true);

    try {
      const { error } = await supabase
        .from("customers")
        .update({
          phone: phone || null,
          address_line1: addressLine1 || null,
          address_line2: addressLine2 || null,
          city: city || null,
          postcode: postcode || null,
          state: state || null,
        })
        .eq("id", customer.id);

      if (error) throw error;
      toast.success("Account details saved!");
    } catch {
      toast.error("Failed to save. Please try again.");
    }

    setSaving(false);
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 px-4">
        <User className="size-12 text-muted-foreground" />
        <h1 className="text-2xl font-[family-name:var(--font-eb-garamond)] text-gold">
          Sign in to your account
        </h1>
        <p className="text-sm text-muted-foreground text-center max-w-md">
          Sign in with Google to view your order history, save your shipping details, and speed up checkout.
        </p>
        <Button
          onClick={handleSignIn}
          className="bg-amrita-gold hover:bg-amrita-gold/90 text-white"
        >
          Sign In with Google
        </Button>
      </div>
    );
  }

  const displayName =
    user.user_metadata?.full_name ||
    user.user_metadata?.name ||
    user.email?.split("@")[0] ||
    "";

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-[family-name:var(--font-eb-garamond)] text-gold mb-8">
        My Account
      </h1>

      {/* Profile Info (read-only from Google) */}
      <Card className="p-6 bg-card mb-6">
        <h2 className="text-lg font-medium mb-4">Profile</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label>Name</Label>
            <Input value={displayName} readOnly className="mt-1 bg-muted/50" />
          </div>
          <div>
            <Label>Email</Label>
            <Input value={user.email || ""} readOnly className="mt-1 bg-muted/50" />
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Name and email are managed by your Google account.
        </p>
      </Card>

      {/* Editable contact & shipping */}
      <Card className="p-6 bg-card">
        <h2 className="text-lg font-medium mb-4">Shipping Details</h2>
        <div className="space-y-4">
          <div>
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="012-345 6789"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="address1">Address Line 1</Label>
            <Input
              id="address1"
              placeholder="Street address"
              value={addressLine1}
              onChange={(e) => setAddressLine1(e.target.value)}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="address2">Address Line 2</Label>
            <Input
              id="address2"
              placeholder="Apartment, unit, etc."
              value={addressLine2}
              onChange={(e) => setAddressLine2(e.target.value)}
              className="mt-1"
            />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                placeholder="City"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="postcode">Postcode</Label>
              <Input
                id="postcode"
                placeholder="12345"
                value={postcode}
                onChange={(e) => setPostcode(e.target.value)}
                className="mt-1"
              />
            </div>
            <div className="col-span-2 sm:col-span-1">
              <Label htmlFor="state">State</Label>
              <Select value={state} onValueChange={(v) => setState(v)}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select state" />
                </SelectTrigger>
                <SelectContent>
                  {MALAYSIAN_STATES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-amrita-gold hover:bg-amrita-gold/90 text-white"
          >
            {saving ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 size-4" />
                Save Details
              </>
            )}
          </Button>
        </div>
      </Card>
    </div>
  );
}
