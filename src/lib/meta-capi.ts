import { createHash } from "crypto";

const PIXEL_ID = process.env.META_PIXEL_ID;
const ACCESS_TOKEN = process.env.META_CONVERSIONS_API_TOKEN;
const API_VERSION = "v21.0";

function sha256(value: string): string {
  return createHash("sha256").update(value.trim().toLowerCase()).digest("hex");
}

interface ConversionEventData {
  value?: number;
  currency?: string;
  orderId?: string;
  email?: string;
  phone?: string;
  contents?: Array<{ id: string; quantity: number }>;
  eventSourceUrl?: string;
  userAgent?: string;
  clientIpAddress?: string;
}

/**
 * Send a server-side event to Meta Conversions API.
 * Silently skips if PIXEL_ID or ACCESS_TOKEN are not configured.
 */
export async function sendConversionEvent(
  eventName: string,
  eventData: ConversionEventData
) {
  if (!PIXEL_ID || !ACCESS_TOKEN) return;

  // Build user_data with hashed PII
  const userData: Record<string, string> = {};
  if (eventData.email) {
    userData.em = sha256(eventData.email);
  }
  if (eventData.phone) {
    // Remove spaces, dashes, and country code prefix for normalization
    const cleanPhone = eventData.phone.replace(/[\s\-+]/g, "");
    userData.ph = sha256(cleanPhone);
  }
  if (eventData.clientIpAddress) {
    userData.client_ip_address = eventData.clientIpAddress;
  }
  if (eventData.userAgent) {
    userData.client_user_agent = eventData.userAgent;
  }

  // Build custom_data
  const customData: Record<string, unknown> = {};
  if (eventData.value !== undefined) customData.value = eventData.value;
  if (eventData.currency) customData.currency = eventData.currency;
  if (eventData.orderId) customData.order_id = eventData.orderId;
  if (eventData.contents) customData.contents = eventData.contents;

  const payload = {
    data: [
      {
        event_name: eventName,
        event_time: Math.floor(Date.now() / 1000),
        action_source: "website",
        event_source_url: eventData.eventSourceUrl,
        user_data: userData,
        custom_data: customData,
      },
    ],
  };

  try {
    const url = `https://graph.facebook.com/${API_VERSION}/${PIXEL_ID}/events?access_token=${ACCESS_TOKEN}`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const body = await res.text();
      console.error("[Meta CAPI] Error:", res.status, body);
    }
  } catch (err) {
    console.error("[Meta CAPI] Failed to send event:", err);
  }
}
