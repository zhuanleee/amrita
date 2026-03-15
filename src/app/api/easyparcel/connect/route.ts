import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const origin = new URL(request.url).origin;
  const clientId = process.env.EASYPARCEL_CLIENT_ID || "f9380693-ad61-4cc2-9320-4dbbfc7b749d";
  const redirectUri = `${origin}/api/easyparcel/callback`;

  const loginUrl = new URL("https://api.easyparcel.com/oauth/login");
  loginUrl.searchParams.set("client_id", clientId);
  loginUrl.searchParams.set("redirect_uri", redirectUri);
  loginUrl.searchParams.set("state", "amrita");

  return NextResponse.redirect(loginUrl.toString());
}
