"use client";

const UTM_STORAGE_KEY = "amrita_utm";

export interface UTMData {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
}

/**
 * Capture UTM parameters from the current URL and store in sessionStorage.
 * Only writes if at least one UTM param is present.
 */
export function captureUTM() {
  if (typeof window === "undefined") return;

  const params = new URLSearchParams(window.location.search);
  const utm: UTMData = {};
  let hasUTM = false;

  for (const key of ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"] as const) {
    const val = params.get(key);
    if (val) {
      utm[key] = val;
      hasUTM = true;
    }
  }

  if (hasUTM) {
    try {
      sessionStorage.setItem(UTM_STORAGE_KEY, JSON.stringify(utm));
    } catch {
      // sessionStorage not available (e.g. private browsing)
    }
  }
}

/**
 * Retrieve stored UTM data from sessionStorage.
 */
export function getUTM(): UTMData | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = sessionStorage.getItem(UTM_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as UTMData;
  } catch {
    return null;
  }
}

/**
 * Clear stored UTM data.
 */
export function clearUTM() {
  if (typeof window === "undefined") return;

  try {
    sessionStorage.removeItem(UTM_STORAGE_KEY);
  } catch {
    // ignore
  }
}
