import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const origin = new URL(request.url).origin;

  if (!code) {
    return NextResponse.redirect(
      `${origin}/admin/settings?easyparcel=error&reason=no_code`
    );
  }

  // Verify state parameter
  if (state !== "amrita") {
    return NextResponse.redirect(
      `${origin}/admin/settings?easyparcel=error&reason=invalid_state`
    );
  }

  const clientId = process.env.EASYPARCEL_CLIENT_ID;
  const clientSecret = process.env.EASYPARCEL_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return NextResponse.redirect(
      `${origin}/admin/settings?easyparcel=error&reason=missing_credentials`
    );
  }

  try {
    const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

    const tokenRes = await fetch("https://api.easyparcel.com/oauth/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${basicAuth}`,
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: `${origin}/api/easyparcel/callback`,
      }).toString(),
    });

    if (!tokenRes.ok) {
      const errText = await tokenRes.text();
      console.error("EasyParcel token exchange failed:", tokenRes.status, errText);
      return NextResponse.redirect(
        `${origin}/admin/settings?easyparcel=error&reason=token_exchange_failed`
      );
    }

    const tokenData = await tokenRes.json();
    const { access_token, refresh_token, expires_at } = tokenData;

    if (!access_token) {
      return NextResponse.redirect(
        `${origin}/admin/settings?easyparcel=error&reason=no_access_token`
      );
    }

    // Store tokens in site_settings
    const supabase = await createClient();
    const entries = [
      { key: "easyparcel_access_token", value: access_token },
      { key: "easyparcel_refresh_token", value: refresh_token || "" },
      { key: "easyparcel_expires_at", value: String(expires_at || "") },
    ];

    for (const entry of entries) {
      const { error } = await supabase
        .from("site_settings")
        .upsert(entry, { onConflict: "key" });

      if (error) {
        console.error("Failed to store EasyParcel token:", error);
        return NextResponse.redirect(
          `${origin}/admin/settings?easyparcel=error&reason=storage_failed`
        );
      }
    }

    return NextResponse.redirect(`${origin}/admin/settings?easyparcel=connected`);
  } catch (err) {
    console.error("EasyParcel OAuth callback error:", err);
    return NextResponse.redirect(
      `${origin}/admin/settings?easyparcel=error&reason=exception`
    );
  }
}
