"use client";

import type Lenis from "lenis";

/**
 * The page's single Lenis instance (created by ScrollMotion), shared so other
 * components can glide to a position instead of jumping. Null when smooth
 * scrolling is off (reduced motion, admin and account pages).
 */
let instance: Lenis | null = null;

export function setLenis(lenis: Lenis | null) {
  instance = lenis;
}

export function getLenis(): Lenis | null {
  return instance;
}
