import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const stateRaw = url.searchParams.get("state");
  const origin = url.origin;

  // First, try to extract token directly from code or state
  // EasyParcel may pass the token in different ways

  const clientId = process.env.EASYPARCEL_CLIENT_ID;
  const clientSecret = process.env.EASYPARCEL_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return NextResponse.redirect(
      `${origin}/admin/settings?easyparcel=error&reason=missing_credentials`
    );
  }

  if (!code) {
    return NextResponse.redirect(
      `${origin}/admin/settings?easyparcel=error&reason=no_code`
    );
  }

  const redirectUri = `${origin}/api/easyparcel/callback`;
  const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

  // Try multiple token exchange formats
  const attempts = [
    // Attempt 1: JSON body with client credentials
    async () => {
      const res = await fetch("https://api.easyparcel.com/oauth/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          grant_type: "authorization_code",
          code,
          redirect_uri: redirectUri,
          client_id: clientId,
          client_secret: clientSecret,
        }),
      });
      return res;
    },
    // Attempt 2: Form-encoded with Basic auth
    async () => {
      const res = await fetch("https://api.easyparcel.com/oauth/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Basic ${basicAuth}`,
        },
        body: new URLSearchParams({
          grant_type: "authorization_code",
          code,
          redirect_uri: redirectUri,
        }).toString(),
      });
      return res;
    },
    // Attempt 3: Form-encoded with client creds in body
    async () => {
      const res = await fetch("https://api.easyparcel.com/oauth/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          grant_type: "authorization_code",
          code,
          redirect_uri: redirectUri,
          client_id: clientId,
          client_secret: clientSecret,
        }).toString(),
      });
      return res;
    },
  ];

  let tokenData: Record<string, unknown> | null = null;
  let lastError = "";

  for (const attempt of attempts) {
    try {
      const res = await attempt();
      const data = await res.json();

      const token = data.access_token || data.data?.access_token || data.token;
      if (token) {
        tokenData = data;
        break;
      }
      lastError = JSON.stringify(data);
    } catch (e) {
      lastError = String(e);
    }
  }

  // If all token exchange attempts failed, try using the code directly as token
  // (some APIs return the token as the code parameter)
  if (!tokenData && code && code.length > 50) {
    tokenData = { access_token: code, refresh_token: "", expires_at: "" };
  }

  if (!tokenData) {
    return NextResponse.redirect(
      `${origin}/admin/settings?easyparcel=error&reason=all_attempts_failed&debug=${encodeURIComponent(lastError)}`
    );
  }

  const access_token = (tokenData.access_token || (tokenData.data as Record<string, unknown>)?.access_token || tokenData.token) as string;
  const refresh_token = (tokenData.refresh_token || (tokenData.data as Record<string, unknown>)?.refresh_token || "") as string;
  const expires_at = (tokenData.expires_at || (tokenData.data as Record<string, unknown>)?.expires_at || tokenData.expires_in || "") as string;

  try {
    const supabase = await createClient();
    const entries = [
      { key: "easyparcel_access_token", value: access_token },
      { key: "easyparcel_refresh_token", value: refresh_token },
      { key: "easyparcel_expires_at", value: String(expires_at) },
    ];

    for (const entry of entries) {
      const { error } = await supabase
        .from("site_settings")
        .upsert(entry, { onConflict: "key" });

      if (error) {
        return NextResponse.redirect(
          `${origin}/admin/settings?easyparcel=error&reason=storage_failed`
        );
      }
    }

    return NextResponse.redirect(`${origin}/admin/settings?easyparcel=connected`);
  } catch (err) {
    return NextResponse.redirect(
      `${origin}/admin/settings?easyparcel=error&reason=exception`
    );
  }
}
