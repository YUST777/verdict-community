"use client";

/**
 * Utility for Rybbit Analytics tracking.
 * This wrapper ensures window.rybbit is available before calling events.
 */

declare global {
  interface Window {
    rybbit?: {
      event: (eventName: string, eventData?: Record<string, any>) => void;
      pageview: () => void;
    };
  }
}

/**
 * Tracks a custom event in Rybbit.
 * @param eventName Name of the event (e.g., 'button_click')
 * @param eventData Optional metadata for the event
 */
export const trackEvent = (eventName: string, eventData?: Record<string, any>) => {
  if (typeof window !== "undefined" && window.rybbit && typeof window.rybbit.event === "function") {
    window.rybbit.event(eventName, eventData);
  } else if (process.env.NODE_ENV === "development") {
    console.warn(`[Analytics] Rybbit event "${eventName}" skipped (script not loaded or SSR).`, eventData);
  }
};

/**
 * Manually triggers a pageview.
 * Rybbit usually handles this automatically in Next.js, but this is here if needed.
 */
export const trackPageView = () => {
  if (typeof window !== "undefined" && window.rybbit && typeof window.rybbit.pageview === "function") {
    window.rybbit.pageview();
  }
};
