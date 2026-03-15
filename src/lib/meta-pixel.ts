"use client";

// Safe wrapper for Meta Pixel (fbq) calls
// All functions are no-ops if the pixel hasn't loaded

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

function fbq(...args: unknown[]) {
  if (typeof window !== "undefined" && window.fbq) {
    window.fbq(...args);
  }
}

export function trackPageView() {
  fbq("track", "PageView");
}

export function trackViewContent(
  productName: string,
  productId: string,
  price: number,
  currency = "MYR"
) {
  fbq("track", "ViewContent", {
    content_name: productName,
    content_ids: [productId],
    content_type: "product",
    value: price,
    currency,
  });
}

export function trackAddToCart(
  productName: string,
  productId: string,
  price: number,
  quantity: number,
  currency = "MYR"
) {
  fbq("track", "AddToCart", {
    content_name: productName,
    content_ids: [productId],
    content_type: "product",
    value: price * quantity,
    currency,
    num_items: quantity,
  });
}

export function trackInitiateCheckout(
  totalValue: number,
  numItems: number,
  currency = "MYR"
) {
  fbq("track", "InitiateCheckout", {
    value: totalValue,
    currency,
    num_items: numItems,
  });
}

export function trackPurchase(
  orderId: string,
  totalValue: number,
  currency = "MYR"
) {
  fbq("track", "Purchase", {
    value: totalValue,
    currency,
    content_type: "product",
    order_id: orderId,
  });
}

export function trackEvent(eventName: string, params?: Record<string, unknown>) {
  fbq("track", eventName, params);
}
