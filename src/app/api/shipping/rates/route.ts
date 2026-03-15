import { NextResponse } from "next/server";
import { checkRates } from "@/lib/easyparcel";
import { getShippingFee } from "@/lib/shipping";
import type { MalaysianState } from "@/lib/types";

const SENDER_POSTCODE = "50000";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const postcode = searchParams.get("postcode");
  const state = searchParams.get("state") as MalaysianState | null;
  const weight = parseFloat(searchParams.get("weight") || "0.3");

  if (!postcode || !state) {
    return NextResponse.json(
      { error: "Missing required params: postcode, state" },
      { status: 400 }
    );
  }

  // Try EasyParcel rates first
  const easyparcelRates = await checkRates(SENDER_POSTCODE, postcode, state, weight);

  if (easyparcelRates.length > 0) {
    return NextResponse.json({
      source: "easyparcel",
      rates: easyparcelRates,
    });
  }

  // Fall back to flat rates
  const flatRate = getShippingFee(state, 0); // pass 0 subtotal to get the actual rate
  return NextResponse.json({
    source: "flat",
    rates: [
      {
        courier_name: "Standard Shipping",
        service_id: "",
        price: flatRate,
        delivery_days: "3-5",
        pickup_date: "",
      },
    ],
  });
}
