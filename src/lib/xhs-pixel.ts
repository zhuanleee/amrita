"use client";

// Safe wrapper for Xiaohongshu (小红书/RED) Pixel tracking
// All functions are no-ops if the pixel hasn't loaded

declare global {
  interface Window {
    _xhsq?: (...args: unknown[]) => void;
  }
}

let xhsLoaded = false;

/**
 * Initialize the XHS tracking pixel.
 * Loads the XHS advertiser tracking script and fires init.
 */
export function initXHSPixel(pixelId: string) {
  if (typeof window === "undefined" || !pixelId) return;
  if (xhsLoaded) return;

  try {
    // XHS pixel snippet — placeholder loader
    // When Xiaohongshu provides the actual advertiser SDK URL, replace the src below.
    const script = document.createElement("script");
    script.async = true;
    script.src = `https://t.xiaohongshu.com/x/pixel.js?id=${pixelId}`;
    script.onload = () => {
      xhsLoaded = true;
    };
    document.head.appendChild(script);

    // Initialize queue if the SDK hasn't loaded yet
    if (!window._xhsq) {
      const queue: unknown[][] = [];
      window._xhsq = (...args: unknown[]) => {
        queue.push(args);
      };
      (window._xhsq as unknown as { queue: unknown[][] }).queue = queue;
    }

    window._xhsq("init", pixelId);
  } catch {
    // Silently skip if loading fails
  }
}

/**
 * Track an XHS event. Silently skips if pixel is not loaded.
 */
export function trackXHSEvent(
  eventName: string,
  params?: Record<string, unknown>
) {
  if (typeof window === "undefined" || !window._xhsq) return;

  try {
    if (params) {
      window._xhsq("track", eventName, params);
    } else {
      window._xhsq("track", eventName);
    }
  } catch {
    // Silently skip
  }
}

/**
 * Track a page view event on XHS.
 */
export function trackXHSPageView() {
  trackXHSEvent("PageView");
}

/**
 * Track a product view on XHS.
 */
export function trackXHSViewContent(
  productName: string,
  productId: string,
  price: number,
  currency = "MYR"
) {
  trackXHSEvent("ViewContent", {
    content_name: productName,
    content_ids: [productId],
    content_type: "product",
    value: price,
    currency,
  });
}

/**
 * Track an add-to-cart event on XHS.
 */
export function trackXHSAddToCart(
  productName: string,
  productId: string,
  price: number,
  quantity: number,
  currency = "MYR"
) {
  trackXHSEvent("AddToCart", {
    content_name: productName,
    content_ids: [productId],
    content_type: "product",
    value: price * quantity,
    currency,
    num_items: quantity,
  });
}

/**
 * Track a purchase event on XHS.
 */
export function trackXHSPurchase(
  orderId: string,
  totalValue: number,
  currency = "MYR"
) {
  trackXHSEvent("Purchase", {
    value: totalValue,
    currency,
    order_id: orderId,
  });
}
