import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  // Skip Supabase auth check if credentials aren't configured
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl || supabaseUrl === "your_supabase_url_here") {
    return NextResponse.next();
  }

  // When Supabase is configured, use the session middleware
  const { updateSession } = await import("@/lib/supabase/middleware");
  return await updateSession(request);
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/login",
    "/auth/:path*",
  ],
};
