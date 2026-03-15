import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const origin = url.origin;

  // Capture ALL parameters from EasyParcel callback
  const allParams: Record<string, string> = {};
  url.searchParams.forEach((value, key) => {
    allParams[key] = value;
  });

  const code = allParams.code;
  const token = allParams.token || allParams.access_token;
  const stateRaw = allParams.state;

  // Try to extract access token from state parameter
  // EasyParcel embeds tokens in the state as base64 JSON
  let stateToken: string | null = null;
  if (stateRaw) {
    try {
      const stateJson = JSON.parse(
        Buffer.from(stateRaw, "base64").toString("utf-8")
      );
      stateToken = stateJson.access_token || stateJson.token || null;
    } catch {
      // State might be plain text, not base64
      try {
        const stateJson = JSON.parse(stateRaw);
        stateToken = stateJson.access_token || stateJson.token || null;
      } catch {
        // Not JSON either
      }
    }
  }

  // Determine the best access token we can find
  const accessToken = token || stateToken || null;

  const clientId = process.env.EASYPARCEL_CLIENT_ID;
  const clientSecret = process.env.EASYPARCEL_CLIENT_SECRET;

  // If we have a direct token, use it
  if (accessToken) {
    return await storeTokenAndRedirect(origin, accessToken, "", "");
  }

  // If we have a code, try to exchange it (fast, single attempt)
  if (code && clientId && clientSecret) {
    const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

    try {
      const res = await fetch("https://api.easyparcel.com/oauth/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Basic ${basicAuth}`,
        },
        body: JSON.stringify({
          grant_type: "authorization_code",
          code,
          redirect_uri: `${origin}/api/easyparcel/callback`,
          client_id: clientId,
          client_secret: clientSecret,
        }),
      });

      const data = await res.json();
      const at = data.access_token || data.data?.access_token;
      const rt = data.refresh_token || data.data?.refresh_token || "";
      const exp = data.expires_at || data.data?.expires_at || "";

      if (at) {
        return await storeTokenAndRedirect(origin, at, rt, String(exp));
      }

      // Token exchange failed — return debug with all params + response
      return NextResponse.redirect(
        `${origin}/admin/settings?easyparcel=error&reason=token_exchange_failed&debug=${encodeURIComponent(
          JSON.stringify({ params: Object.keys(allParams), exchange_response: data })
        )}`
      );
    } catch (err) {
      return NextResponse.redirect(
        `${origin}/admin/settings?easyparcel=error&reason=exception&debug=${encodeURIComponent(String(err))}`
      );
    }
  }

  // Nothing worked — show what we received for debugging
  return NextResponse.redirect(
    `${origin}/admin/settings?easyparcel=error&reason=no_token_or_code&debug=${encodeURIComponent(
      JSON.stringify({ params: Object.keys(allParams) })
    )}`
  );
}

async function storeTokenAndRedirect(
  origin: string,
  accessToken: string,
  refreshToken: string,
  expiresAt: string
) {
  try {
    const supabase = await createClient();
    const entries = [
      { key: "easyparcel_access_token", value: accessToken },
      { key: "easyparcel_refresh_token", value: refreshToken },
      { key: "easyparcel_expires_at", value: expiresAt },
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
  } catch {
    return NextResponse.redirect(
      `${origin}/admin/settings?easyparcel=error&reason=storage_exception`
    );
  }
}
