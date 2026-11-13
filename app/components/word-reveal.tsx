"use client";

import { useEffect, useLayoutEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const useIsomorphicLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

/**
 * Large statement text whose words brighten one by one as the reader scrolls through it.
 * Each entry in `lines` is kept on its own line on wider screens.
 */
export function WordReveal({ lines, accent }: { lines: string[]; accent?: string }) {
  const root = useRef<HTMLParagraphElement>(null);
  const accentWords = new Set((accent ?? "").split(" ").filter(Boolean));

  useIsomorphicLayoutEffect(() => {
    const element = root.current;
    if (!element || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    gsap.registerPlugin(ScrollTrigger);
    const context = gsap.context(() => {
      gsap.fromTo(
        "[data-word]",
        { opacity: 0.16 },
        {
          opacity: 1,
          stagger: 0.12,
          ease: "none",
          scrollTrigger: { trigger: element, start: "top 82%", end: "bottom 45%", scrub: 0.5 },
        },
      );
    }, element);
    return () => context.revert();
  }, []);

  return (
    <p className="xp-statement-text" ref={root}>
      {lines.map((line, lineIndex) => (
        <span className="xp-statement-line" key={lineIndex}>
          {line.split(" ").map((word, index) => (
            <span key={`${word}-${index}`} data-word className={accentWords.has(word) ? "is-accent" : undefined}>
              {word}{" "}
            </span>
          ))}
        </span>
      ))}
    </p>
  );
}
