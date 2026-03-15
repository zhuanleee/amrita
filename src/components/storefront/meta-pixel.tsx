"use client";

import { useEffect, useState } from "react";
import { trackPageView } from "@/lib/meta-pixel";

export function MetaPixel() {
  const envPixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID;
  const [pixelId, setPixelId] = useState(envPixelId || "");

  useEffect(() => {
    // If no env var pixel ID, try fetching from settings API
    if (!envPixelId) {
      fetch("/api/settings")
        .then((r) => r.ok ? r.json() : null)
        .then((settings) => {
          if (settings?.meta_pixel_id) {
            setPixelId(settings.meta_pixel_id);
          }
        })
        .catch(() => {});
    }
  }, [envPixelId]);

  useEffect(() => {
    if (!pixelId) return;
    if (window.fbq) return; // Already initialized

    /* eslint-disable */
    (function (f: any, b: any, e: any, v: any, n?: any, t?: any, s?: any) {
      if (f.fbq) return;
      n = f.fbq = function () {
        n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
      };
      if (!f._fbq) f._fbq = n;
      n.push = n;
      n.loaded = !0;
      n.version = "2.0";
      n.queue = [];
      t = b.createElement(e);
      t.async = !0;
      t.src = v;
      s = b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t, s);
    })(
      window,
      document,
      "script",
      "https://connect.facebook.net/en_US/fbevents.js"
    );
    /* eslint-enable */

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).fbq?.("init", pixelId);
    trackPageView();
  }, [pixelId]);

  if (!pixelId) return null;

  return (
    <noscript>
      <img
        height="1"
        width="1"
        style={{ display: "none" }}
        src={`https://www.facebook.com/tr?id=${pixelId}&ev=PageView&noscript=1`}
        alt=""
      />
    </noscript>
  );
}
