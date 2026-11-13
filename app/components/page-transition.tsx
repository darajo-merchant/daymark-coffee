"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { BeanMark } from "./bean-mark";
import { getLenis } from "./smooth-scroll";

import { TRANSITION_KEY } from "./page-transition-script";

const CLOSED = "inset(0% 0% 0% 0%)";
const BELOW = "inset(100% 0% 0% 0%)";
const ABOVE = "inset(0% 0% 100% 0%)";

/** Links to another page close a coffee-coloured curtain first; the next page opens it. */
export function PageTransition() {
  const curtain = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const panel = curtain.current;
    if (!panel || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const brand = panel.querySelectorAll<HTMLElement>("[data-curtain-brand]");
    const html = document.documentElement;
    const hide = () => gsap.set(panel, { visibility: "hidden", clipPath: BELOW, pointerEvents: "none" });

    // ---- Arrive: the curtain was painted closed (see arrivingScript); lift it off the page.
    let arrive: gsap.core.Timeline | undefined;
    if (html.hasAttribute("data-arriving")) {
      gsap.set(panel, { visibility: "visible", clipPath: CLOSED, pointerEvents: "auto" });
      gsap.set(brand, { autoAlpha: 1, y: 0 });
      html.removeAttribute("data-arriving");
      arrive = gsap.timeline({ onComplete: hide })
        .to(brand, { autoAlpha: 0, y: -14, duration: 0.3, ease: "power2.in", stagger: 0.04 })
        .fromTo(panel, { clipPath: CLOSED }, { clipPath: ABOVE, duration: 0.85, ease: "power4.inOut" }, 0.12);
    } else {
      hide();
    }

    // ---- Leave: intercept ordinary clicks on links to another page of this site.
    let leaving = false;
    let leaveTimeline: gsap.core.Timeline | undefined;
    let fallback = 0;
    let recover = 0;
    const reset = () => {
      leaving = false;
      window.clearTimeout(fallback);
      window.clearTimeout(recover);
      leaveTimeline?.kill();
      try { sessionStorage.removeItem(TRANSITION_KEY); } catch { /* storage blocked */ }
      getLenis()?.start();
      hide();
    };
    const leave = (href: string) => {
      leaving = true;
      getLenis()?.stop();
      try { sessionStorage.setItem(TRANSITION_KEY, String(Date.now())); } catch { /* storage blocked */ }
      let gone = false;
      const go = () => { if (!gone) { gone = true; window.location.assign(href); } };
      gsap.set(panel, { visibility: "visible", pointerEvents: "auto" });
      leaveTimeline = gsap.timeline({ onComplete: go })
        .fromTo(panel, { clipPath: BELOW }, { clipPath: CLOSED, duration: 0.62, ease: "power4.inOut" })
        .fromTo(brand, { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, duration: 0.4, ease: "power3.out", stagger: 0.05 }, 0.3);
      fallback = window.setTimeout(go, 1100); // navigate even if frames are throttled
      recover = window.setTimeout(reset, 6000); // the page never left (e.g. a slow or failed load)
    };

    const onClick = (event: MouseEvent) => {
      if (leaving || event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const anchor = event.target instanceof Element ? event.target.closest<HTMLAnchorElement>("a[href]") : null;
      if (!anchor || (anchor.target && anchor.target !== "_self")) return;
      if (anchor.hasAttribute("download") || anchor.hasAttribute("data-no-transition")) return;
      const url = new URL(anchor.href, window.location.href);
      if (url.origin !== window.location.origin || url.pathname.startsWith("/api/")) return;
      // Same page (only the hash differs): ScrollMotion glides there instead.
      if (url.pathname === window.location.pathname && url.search === window.location.search) return;
      event.preventDefault();
      leave(url.href);
    };

    // Warm the next page while the pointer rests on a link, so the curtain opens sooner.
    const prefetched = new Set<string>();
    const onHover = (event: PointerEvent) => {
      const anchor = event.target instanceof Element ? event.target.closest<HTMLAnchorElement>("a[href]") : null;
      if (!anchor || anchor.hasAttribute("download")) return;
      const url = new URL(anchor.href, window.location.href);
      if (url.origin !== window.location.origin || url.pathname.startsWith("/api/") || url.pathname === window.location.pathname) return;
      const key = url.pathname + url.search;
      if (prefetched.has(key)) return;
      prefetched.add(key);
      const link = document.createElement("link");
      link.rel = "prefetch";
      link.href = key;
      document.head.appendChild(link);
    };

    // Back/forward restores a frozen page with the curtain still closed: open it again.
    const onPageShow = (event: PageTransitionEvent) => { if (event.persisted) reset(); };

    // Bubble phase on window, so link handlers that call preventDefault run first.
    window.addEventListener("click", onClick);
    document.addEventListener("pointerover", onHover, { passive: true });
    window.addEventListener("pageshow", onPageShow);
    return () => {
      window.removeEventListener("click", onClick);
      document.removeEventListener("pointerover", onHover);
      window.removeEventListener("pageshow", onPageShow);
      window.clearTimeout(fallback);
      window.clearTimeout(recover);
      arrive?.kill();
      leaveTimeline?.kill();
      hide();
    };
  }, []);

  return (
    <div className="xp-curtain" ref={curtain} aria-hidden="true">
      <div className="xp-curtain-brand">
        <span data-curtain-brand className="xp-curtain-mark"><BeanMark /></span>
        <span data-curtain-brand className="xp-curtain-name">Daymark</span>
        <span data-curtain-brand className="xp-curtain-line">Coffee for the day ahead</span>
      </div>
    </div>
  );
}
