"use client";

import { useEffect, useState } from "react";
import { initXHSPixel, trackXHSPageView } from "@/lib/xhs-pixel";

export function XHSPixel() {
  const [pixelId, setPixelId] = useState("");

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => (r.ok ? r.json() : null))
      .then((settings) => {
        if (settings?.xhs_pixel_id) {
          setPixelId(settings.xhs_pixel_id);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!pixelId) return;

    initXHSPixel(pixelId);
    trackXHSPageView();
  }, [pixelId]);

  return null;
}
