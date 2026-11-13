"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

const publicPages = new Set(["/", "/our-story", "/menu", "/visit", "/contact"]);

export function SiteViewTracker() {
  const pathname = usePathname();
  const lastTrackedPath = useRef<string | null>(null);

  useEffect(() => {
    if (!publicPages.has(pathname) || lastTrackedPath.current === pathname) return;
    lastTrackedPath.current = pathname;

    void fetch("/api/analytics/view", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path: pathname }),
      keepalive: true,
    }).catch(() => undefined);
  }, [pathname]);

  return null;
}
