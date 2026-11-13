"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import type { MenuItem } from "../../lib/site-content";

// Same photo mapping as the menu page; unknown drinks fall back to the bean close-up.
const drinkPhotos: Record<string, string> = {
  espresso: "/images/pages/drink-espresso.webp",
  americano: "/images/pages/drink-americano.webp",
  cappuccino: "/images/pages/drink-cappuccino.webp",
  "flat-white": "/images/pages/drink-flat-white.webp",
  latte: "/images/pages/drink-latte.webp",
  mocha: "/images/pages/drink-mocha.webp",
};
const fallbackPhoto = "/media/bean-poster.webp";

/** The home menu list; on mouse devices a drink photo glides along with the cursor. */
export function MenuShowcase({ items }: { items: MenuItem[] }) {
  const root = useRef<HTMLDivElement>(null);
  const floatRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(-1);
  const [enabled, setEnabled] = useState(false);

  // Enable only for mouse users who are fine with motion; the float renders after this flips.
  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)").matches && !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (fine) setEnabled(true);
  }, []);

  useEffect(() => {
    const wrap = root.current;
    const float = floatRef.current;
    if (!enabled || !wrap || !float) return;

    const xTo = gsap.quickTo(float, "x", { duration: 0.5, ease: "power3" });
    const yTo = gsap.quickTo(float, "y", { duration: 0.5, ease: "power3" });
    const move = (event: MouseEvent) => {
      const rect = wrap.getBoundingClientRect();
      xTo(event.clientX - rect.left);
      yTo(event.clientY - rect.top);
    };
    wrap.addEventListener("mousemove", move);
    return () => wrap.removeEventListener("mousemove", move);
  }, [enabled]);

  return (
    <div className="xp-menu-wrap" ref={root} onMouseLeave={() => setActive(-1)}>
      <ol className="xp-menu-list" data-reveal-group data-draw-lines>
        {items.map((item, index) => (
          <li key={item.id} data-reveal-item onMouseEnter={() => setActive(index)}>
            <span className="xp-menu-index">{String(index + 1).padStart(2, "0")}</span>
            <div className="xp-menu-name">
              <h3>{item.name}</h3>
              <p>{item.note}</p>
            </div>
            <span className="xp-menu-price">{item.price || "Price soon"}</span>
          </li>
        ))}
      </ol>

      {enabled && (
        <div className={`xp-menu-float ${active >= 0 ? "is-on" : ""}`} ref={floatRef} aria-hidden="true">
          {items.map((item, index) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={item.id} src={drinkPhotos[item.id] ?? fallbackPhoto} alt="" loading="lazy" className={index === active ? "is-active" : ""} />
          ))}
        </div>
      )}
    </div>
  );
}
