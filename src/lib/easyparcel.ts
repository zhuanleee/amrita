import type { MalaysianState } from "./types";

// Malaysian state name → EasyParcel state code mapping
const STATE_CODES: Record<string, string> = {
  "Kuala Lumpur": "kul",
  Selangor: "sgr",
  Johor: "jhr",
  Penang: "png",
  Perak: "prk",
  Kedah: "kdh",
  Kelantan: "ktn",
  Terengganu: "trg",
  Pahang: "phg",
  "Negeri Sembilan": "nsn",
  Melaka: "mlk",
  Perlis: "pls",
  Sabah: "sbh",
  Sarawak: "swk",
  Putrajaya: "pjy",
  Labuan: "lbn",
};

// Default sender (AMRITA warehouse)
const SENDER = {
  pick_name: "AMRITA HQ",
  pick_contact: "+60123456789",
  pick_addr1: "Kuala Lumpur",
  pick_city: "Kuala Lumpur",
  pick_state: "kul",
  pick_code: "50000",
  pick_country: "MY",
};

export function getStateCode(stateName: string): string {
  return STATE_CODES[stateName] ?? stateName.toLowerCase().slice(0, 3);
}

function getBaseUrl(): string {
  const sandbox = process.env.NEXT_PUBLIC_EASYPARCEL_SANDBOX;
  if (sandbox === "false") {
    return "https://connect.easyparcel.my/?ac=";
  }
  return "http://demo.connect.easyparcel.my/?ac=";
}

function getApiKey(): string | null {
  return process.env.EASYPARCEL_API_KEY || null;
}

async function callEasyParcel(
  action: string,
  params: Record<string, unknown>
): Promise<unknown> {
  const apiKey = getApiKey();
  if (!apiKey) return null;

  const url = `${getBaseUrl()}${action}`;

  // Build form-encoded body
  const formBody = new URLSearchParams();
  formBody.append("api", apiKey);

  function flatten(obj: Record<string, unknown>, prefix = "") {
    for (const [key, value] of Object.entries(obj)) {
      const fullKey = prefix ? `${prefix}[${key}]` : key;
      if (value !== null && typeof value === "object" && !Array.isArray(value)) {
        flatten(value as Record<string, unknown>, fullKey);
      } else {
        formBody.append(fullKey, String(value ?? ""));
      }
    }
  }

  flatten(params);

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: formBody.toString(),
  });

  if (!res.ok) {
    console.error(`EasyParcel API error: ${res.status} ${res.statusText}`);
    return null;
  }

  return res.json();
}

export interface ShippingRate {
  courier_name: string;
  service_id: string;
  price: number;
  delivery_days: string;
  pickup_date: string;
}

export async function checkRates(
  senderPostcode: string,
  receiverPostcode: string,
  receiverState: MalaysianState | string,
  weightKg: number
): Promise<ShippingRate[]> {
  const stateCode = getStateCode(receiverState);

  const result = await callEasyParcel("EPRateCheckingBulk", {
    "bulk[0][pick_code]": senderPostcode,
    "bulk[0][pick_state]": SENDER.pick_state,
    "bulk[0][pick_country]": "MY",
    "bulk[0][send_code]": receiverPostcode,
    "bulk[0][send_state]": stateCode,
    "bulk[0][send_country]": "MY",
    "bulk[0][weight]": String(weightKg),
  });

  if (!result || typeof result !== "object") return [];

  try {
    // EasyParcel returns { result: [ { rates: [...] } ] } or similar structures
    const data = result as Record<string, unknown>;
    const resultArr = data.result as Array<Record<string, unknown>> | undefined;
    if (!resultArr || !Array.isArray(resultArr) || resultArr.length === 0) return [];

    const ratesData = resultArr[0];
    const rates = (ratesData.rates ?? ratesData.pgeon_rates ?? []) as Array<
      Record<string, unknown>
    >;

    if (!Array.isArray(rates)) return [];

    return rates
      .filter((r) => r.service_id)
      .map((r) => ({
        courier_name: String(r.courier_name ?? r.service_name ?? ""),
        service_id: String(r.service_id),
        price: parseFloat(String(r.price ?? r.rate ?? "0")),
        delivery_days: String(r.delivery ?? r.delivery_days ?? ""),
        pickup_date: String(r.pickup_date ?? r.collect_date ?? ""),
      }))
      .sort((a, b) => a.price - b.price);
  } catch (err) {
    console.error("Failed to parse EasyParcel rates:", err);
    return [];
  }
}

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
  content: string;
  collectDate: string; // YYYY-MM-DD
}

export async function createShipment(
  orderData: CreateShipmentData
): Promise<ShipmentResult | null> {
  const stateCode = getStateCode(orderData.receiverState);

  const result = await callEasyParcel("EPSubmitOrderBulk", {
    "bulk[0][pick_name]": SENDER.pick_name,
    "bulk[0][pick_contact]": SENDER.pick_contact,
    "bulk[0][pick_addr1]": SENDER.pick_addr1,
    "bulk[0][pick_city]": SENDER.pick_city,
    "bulk[0][pick_state]": SENDER.pick_state,
    "bulk[0][pick_code]": SENDER.pick_code,
    "bulk[0][pick_country]": SENDER.pick_country,
    "bulk[0][send_name]": orderData.receiverName,
    "bulk[0][send_contact]": orderData.receiverPhone,
    "bulk[0][send_addr1]": orderData.receiverAddr1,
    "bulk[0][send_addr2]": orderData.receiverAddr2 ?? "",
    "bulk[0][send_city]": orderData.receiverCity,
    "bulk[0][send_state]": stateCode,
    "bulk[0][send_code]": orderData.receiverPostcode,
    "bulk[0][send_country]": "MY",
    "bulk[0][service_id]": orderData.serviceId,
    "bulk[0][weight]": String(orderData.weightKg),
    "bulk[0][content]": orderData.content,
    "bulk[0][collect_date]": orderData.collectDate,
  });

  if (!result || typeof result !== "object") return null;

  try {
    const data = result as Record<string, unknown>;
    const resultArr = data.result as Array<Record<string, unknown>> | undefined;
    if (!resultArr || !Array.isArray(resultArr) || resultArr.length === 0) return null;

    const first = resultArr[0];
    return {
      order_no: String(first.order_no ?? first.order_number ?? ""),
      parcel_no: String(first.parcel_no ?? first.parcel_number ?? ""),
    };
  } catch (err) {
    console.error("Failed to parse EasyParcel shipment:", err);
    return null;
  }
}

export interface AWBResult {
  awb: string;
  awb_label_url: string;
  tracking_url: string;
}

export async function payAndGetAWB(orderNo: string): Promise<AWBResult | null> {
  const result = await callEasyParcel("EPPayOrderBulk", {
    "bulk[0][order_no]": orderNo,
  });

  if (!result || typeof result !== "object") return null;

  try {
    const data = result as Record<string, unknown>;
    const resultArr = data.result as Array<Record<string, unknown>> | undefined;
    if (!resultArr || !Array.isArray(resultArr) || resultArr.length === 0) return null;

    const first = resultArr[0];
    return {
      awb: String(first.awb ?? first.awb_no ?? first.tracking_number ?? ""),
      awb_label_url: String(first.awb_id_link ?? first.label_url ?? first.awb_label ?? ""),
      tracking_url: String(first.tracking_url ?? first.track_url ?? ""),
    };
  } catch (err) {
    console.error("Failed to parse EasyParcel AWB:", err);
    return null;
  }
}

export interface TrackingEvent {
  date: string;
  status: string;
  location: string;
}

export async function trackParcel(awbNo: string): Promise<TrackingEvent[]> {
  const result = await callEasyParcel("EPTrackingBulk", {
    "bulk[0][awb_no]": awbNo,
  });

  if (!result || typeof result !== "object") return [];

  try {
    const data = result as Record<string, unknown>;
    const resultArr = data.result as Array<Record<string, unknown>> | undefined;
    if (!resultArr || !Array.isArray(resultArr) || resultArr.length === 0) return [];

    const first = resultArr[0];
    const history = (first.tracking ?? first.checkpoints ?? []) as Array<
      Record<string, unknown>
    >;

    if (!Array.isArray(history)) return [];

    return history.map((h) => ({
      date: String(h.date ?? h.datetime ?? ""),
      status: String(h.status ?? h.description ?? ""),
      location: String(h.location ?? h.place ?? ""),
    }));
  } catch (err) {
    console.error("Failed to parse EasyParcel tracking:", err);
    return [];
  }
}
