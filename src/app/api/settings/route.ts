import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET /api/settings — read all settings
export async function GET() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("site_settings")
    .select("key, value");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const settings: Record<string, string> = {};
  (data ?? []).forEach((row: { key: string; value: string }) => {
    settings[row.key] = row.value;
  });

  return NextResponse.json(settings);
}

// POST /api/settings — update settings
export async function POST(request: Request) {
  const supabase = await createClient();
  const body = await request.json();

  const entries = Object.entries(body) as [string, string][];

  for (const [key, value] of entries) {
    const { error } = await supabase
      .from("site_settings")
      .upsert({ key, value }, { onConflict: "key" });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  return NextResponse.json({ success: true });
}
