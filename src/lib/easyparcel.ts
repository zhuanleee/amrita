import { createClient } from "@/lib/supabase/server";
import type { MalaysianState } from "./types";

// EasyParcel OAuth2 OpenAPI
const BASE_URL = "https://api.easyparcel.com/open_api/2026-03";

// Malaysian state name → ISO 3166-2:MY subdivision code
const SUBDIVISION_CODES: Record<string, string> = {
  "Kuala Lumpur": "MY-14",
  Selangor: "MY-10",
  Johor: "MY-01",
  Penang: "MY-07",
  Perak: "MY-08",
  Kedah: "MY-02",
  Kelantan: "MY-03",
  Terengganu: "MY-11",
  Pahang: "MY-06",
  "Negeri Sembilan": "MY-05",
  Melaka: "MY-04",
  Perlis: "MY-09",
  Sabah: "MY-12",
  Sarawak: "MY-13",
  Putrajaya: "MY-16",
  Labuan: "MY-15",
};

// Default sender (AMRITA warehouse)
const SENDER = {
  postcode: "50000",
  subdivision_code: "MY-14",
  country: "MY",
};

export function getSubdivisionCode(stateName: string): string {
  return SUBDIVISION_CODES[stateName] ?? `MY-${stateName}`;
}

// Legacy alias for backwards compatibility
export function getStateCode(stateName: string): string {
  return getSubdivisionCode(stateName);
}

/**
 * Reads the access token from site_settings via Supabase.
 * If expired, refreshes using the refresh_token.
 * Returns the token string or null if not connected.
 */
export async function getAccessToken(): Promise<string | null> {
  try {
    const supabase = await createClient();

    const { data } = await supabase
      .from("site_settings")
      .select("key, value")
      .in("key", [
        "easyparcel_access_token",
        "easyparcel_refresh_token",
        "easyparcel_expires_at",
      ]);

    if (!data || data.length === 0) return null;

    const settings: Record<string, string> = {};
    data.forEach((row: { key: string; value: string }) => {
      settings[row.key] = row.value;
    });

    const accessToken = settings.easyparcel_access_token;
    const refreshToken = settings.easyparcel_refresh_token;
    const expiresAt = settings.easyparcel_expires_at;

    if (!accessToken) return null;

    // Check if token is expired (with 5 min buffer)
    if (expiresAt) {
      const expiresAtMs = parseInt(expiresAt, 10) * 1000;
      const now = Date.now();
      if (now > expiresAtMs - 5 * 60 * 1000) {
        // Token expired or about to expire — try refresh
        if (refreshToken) {
          return await refreshAccessToken(refreshToken);
        }
        return null;
      }
    }

    return accessToken;
  } catch (err) {
    console.error("Failed to get EasyParcel access token:", err);
    return null;
  }
}

/**
 * Refreshes the access token using the refresh_token.
 * Stores the new tokens in site_settings.
 */
async function refreshAccessToken(refreshToken: string): Promise<string | null> {
  try {
    const clientId = process.env.EASYPARCEL_CLIENT_ID;
    const clientSecret = process.env.EASYPARCEL_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      console.error("Missing EasyParcel OAuth2 client credentials");
      return null;
    }

    const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

    const res = await fetch("https://api.easyparcel.com/oauth/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${basicAuth}`,
      },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: refreshToken,
      }).toString(),
    });

    if (!res.ok) {
      console.error(`EasyParcel token refresh failed: ${res.status}`);
      return null;
    }

    const tokenData = await res.json();
    const { access_token, refresh_token, expires_at } = tokenData;

    if (!access_token) return null;

    // Store new tokens in site_settings
    const supabase = await createClient();
    const entries = [
      { key: "easyparcel_access_token", value: access_token },
      { key: "easyparcel_refresh_token", value: refresh_token || refreshToken },
      { key: "easyparcel_expires_at", value: String(expires_at || "") },
    ];

    for (const entry of entries) {
      await supabase
        .from("site_settings")
        .upsert(entry, { onConflict: "key" });
    }

    return access_token;
  } catch (err) {
    console.error("Failed to refresh EasyParcel token:", err);
    return null;
  }
}

// ---------- Rate Types ----------

export interface ShippingRate {
  courier_name: string;
  service_id: string;
  price: number;
  delivery_days: string;
  pickup_date: string;
}

/**
 * Check shipping rates via EasyParcel OpenAPI.
 */
export async function checkRates(
  accessToken: string,
  senderPostcode: string,
  receiverPostcode: string,
  receiverState: MalaysianState | string,
  weightKg: number
): Promise<ShippingRate[]> {
  const subdivisionCode = getSubdivisionCode(receiverState);

  try {
    const res = await fetch(`${BASE_URL}/shipment/quotations`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        sender: {
          postcode: senderPostcode,
          subdivision_code: SENDER.subdivision_code,
          country: SENDER.country,
        },
        receiver: {
          postcode: receiverPostcode,
          subdivision_code: subdivisionCode,
          country: "MY",
        },
        weight: weightKg,
      }),
    });

    if (!res.ok) {
      console.error(`EasyParcel rate check failed: ${res.status}`);
      return [];
    }

    const data = await res.json();

    // Parse response — the OpenAPI may return rates in various structures
    const rates = Array.isArray(data)
      ? data
      : Array.isArray(data.rates)
        ? data.rates
        : Array.isArray(data.result)
          ? data.result
          : [];

    return rates
      .filter((r: Record<string, unknown>) => r.service_id)
      .map((r: Record<string, unknown>) => ({
        courier_name: String(r.courier_name ?? r.service_name ?? ""),
        service_id: String(r.service_id),
        price: parseFloat(String(r.price ?? r.rate ?? "0")),
        delivery_days: String(r.delivery ?? r.delivery_days ?? ""),
        pickup_date: String(r.pickup_date ?? r.collect_date ?? ""),
      }))
      .sort((a: ShippingRate, b: ShippingRate) => a.price - b.price);
  } catch (err) {
    console.error("Failed to check EasyParcel rates:", err);
    return [];
  }
}

// ---------- Shipment Types ----------

export interface ShipmentResult {
  order_no: string;
  parcel_no: string;
}

export interface CreateShipmentData {
  serviceId: string;
  receiverName: string;
  receiverPhone: string;
  receiverAddr1: string;
  receiverAddr2?: string;
  receiverCity: string;
  receiverPostcode: string;
  receiverState: string;
  weightKg: number;
  width?: number;
  length?: number;
  height?: number;
  content: string;
  collectDate: string; // YYYY-MM-DD
}

/**
 * Submit a shipment order via EasyParcel OpenAPI.
 */
export async function createShipment(
  accessToken: string,
  orderData: CreateShipmentData
): Promise<ShipmentResult | null> {
  const subdivisionCode = getSubdivisionCode(orderData.receiverState);

  try {
    const res = await fetch(`${BASE_URL}/shipment/submit_orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        service_id: orderData.serviceId,
        sender: {
          name: "AMRITA HQ",
          phone: "+60123456789",
          address1: "Kuala Lumpur",
          city: "Kuala Lumpur",
          postcode: SENDER.postcode,
          subdivision_code: SENDER.subdivision_code,
          country: SENDER.country,
        },
        receiver: {
          name: orderData.receiverName,
          phone: orderData.receiverPhone,
          address1: orderData.receiverAddr1,
          address2: orderData.receiverAddr2 ?? "",
          city: orderData.receiverCity,
          postcode: orderData.receiverPostcode,
          subdivision_code: subdivisionCode,
          country: "MY",
        },
        weight: orderData.weightKg,
        width: orderData.width ?? 10,
        length: orderData.length ?? 10,
        height: orderData.height ?? 10,
        content: orderData.content,
        collection_date: orderData.collectDate,
      }),
    });

    if (!res.ok) {
      console.error(`EasyParcel submit order failed: ${res.status}`);
      return null;
    }

    const data = await res.json();

    // Parse response
    const result = data.result ?? data;
    const first = Array.isArray(result) ? result[0] : result;

    if (!first) return null;

    return {
      order_no: String(first.order_no ?? first.order_number ?? ""),
      parcel_no: String(first.parcel_no ?? first.parcel_number ?? ""),
    };
  } catch (err) {
    console.error("Failed to create EasyParcel shipment:", err);
    return null;
  }
}

// ---------- Tracking ----------

export interface TrackingEvent {
  date: string;
  status: string;
  location: string;
}

/**
 * Track a parcel via EasyParcel OpenAPI.
 */
export async function trackParcel(
  accessToken: string,
  trackingNumber: string
): Promise<TrackingEvent[]> {
  try {
    const url = new URL(`${BASE_URL}/shipment/tracking_status`);
    url.searchParams.set("tracking_number", trackingNumber);

    const res = await fetch(url.toString(), {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!res.ok) {
      console.error(`EasyParcel tracking failed: ${res.status}`);
      return [];
    }

    const data = await res.json();

    const history = Array.isArray(data)
      ? data
      : Array.isArray(data.tracking)
        ? data.tracking
        : Array.isArray(data.checkpoints)
          ? data.checkpoints
          : Array.isArray(data.result)
            ? data.result
            : [];

    return history.map((h: Record<string, unknown>) => ({
      date: String(h.date ?? h.datetime ?? ""),
      status: String(h.status ?? h.description ?? ""),
      location: String(h.location ?? h.place ?? ""),
    }));
  } catch (err) {
    console.error("Failed to track EasyParcel parcel:", err);
    return [];
  }
}
