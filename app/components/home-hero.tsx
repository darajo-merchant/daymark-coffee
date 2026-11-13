"use client";

import { useEffect, useLayoutEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowIcon } from "./arrow-icon";
import { BeanMark } from "./bean-mark";
import { headerOffset } from "./process-story";

const useIsomorphicLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

/** Below this width the headline sits above the arch instead of flanking it. */
const STACKED_QUERY = "(max-width: 899px)";
const FULL_CLIP = "inset(0px 0px 0px 0px round 0px 0px 0px 0px)";

/**
 * Measures the hero and returns the arch's starting clip-path in pixels, so the
 * arch always fits between the headline and the buttons at any screen size.
 */
function measureArch(pin: HTMLElement, stacked: boolean) {
  const width = pin.clientWidth;
  const height = pin.clientHeight;
  const gutter = parseFloat(getComputedStyle(pin).getPropertyValue("--gutter")) || 24;
  let top: number;
  let bottom: number;
  let archWidth: number;

  if (stacked) {
    // Use layout offsets (not bounding boxes) so in-flight transforms never skew the numbers.
    const lastWord = pin.querySelector<HTMLElement>(".xp-hero-word--d");
    const intro = pin.querySelector<HTMLElement>(".xp-hero-intro");
    const titleBottom = lastWord ? lastWord.offsetTop + lastWord.offsetHeight : height * 0.22;
    const introTop = intro ? intro.offsetTop : height * 0.86;
    top = titleBottom + 18;
    bottom = height - introTop + 18;
    const available = Math.max(160, height - top - bottom);
    archWidth = Math.min(width - gutter * 2, available * 0.8);
  } else {
    top = height * 0.1;
    bottom = height * 0.075;
    archWidth = Math.min(Math.max(240, width * 0.28), 520, (height - top - bottom) * 0.7);
    pin.style.setProperty("--arch-w", `${Math.round(archWidth)}px`);
  }

  const side = Math.max(0, (width - archWidth) / 2);
  const radius = archWidth / 2;
  return `inset(${top}px ${side}px ${bottom}px ${side}px round ${radius}px ${radius}px 24px 24px)`;
}

export function HomeHero() {
  const root = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useIsomorphicLayoutEffect(() => {
    const section = root.current;
    const video = videoRef.current;
    const pin = section?.querySelector<HTMLElement>("[data-hero-pin]");
    if (!section || !pin) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion) {
      video?.pause();
      return;
    }

    // Only spend decoding time on the clip while the hero is on screen.
    let observer: IntersectionObserver | undefined;
    if (video) {
      observer = new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting) void video.play().catch(() => undefined);
        else video.pause();
      }, { threshold: 0.05 });
      observer.observe(section);
    }

    gsap.registerPlugin(ScrollTrigger);
    const media = gsap.matchMedia();
    const context = gsap.context(() => {
      media.add({ stacked: STACKED_QUERY, wide: "(min-width: 900px)" }, (ctx) => {
        const stacked = Boolean(ctx.conditions?.stacked);
        gsap.set("[data-hero-statement]", { autoAlpha: 1 });
        gsap.set("[data-statement-line]", { yPercent: 115 });
        gsap.set("[data-statement-label]", { autoAlpha: 0, y: 14 });

        // Entrance: the arch rises, the headline slides up out of its masks, then the intro settles in.
        const intro = gsap.timeline({ defaults: { ease: "expo.out" } });
        intro
          .fromTo("[data-hero-media]", { autoAlpha: 0, yPercent: 6 }, { autoAlpha: 1, yPercent: 0, duration: 1.6 }, 0.05)
          .fromTo("[data-hero-line]", { yPercent: 110 }, { yPercent: 0, duration: 1.3, stagger: 0.09 }, 0.2)
          // Entrance animates the children; the scroll timeline owns the containers, so they never fight.
          .fromTo("[data-hero-fade] > *", { autoAlpha: 0, y: 18 }, { autoAlpha: 1, y: 0, duration: 1.1, stagger: 0.08 }, 0.65);

        // Safety net: if the browser throttles animation frames (background tab, busy or low-power device),
        // jump the entrance to its end so the hero is never left blank.
        const revealTimer = window.setTimeout(() => {
          if (intro.progress() < 1) intro.progress(1);
        }, 2600);
        const revealOnReturn = () => {
          if (document.visibilityState === "visible" && intro.progress() < 1) intro.progress(1);
        };
        document.addEventListener("visibilitychange", revealOnReturn);

        const outward = stacked ? { yPercent: -40 } : { xPercent: 70 };
        const inward = stacked ? { yPercent: -40 } : { xPercent: -70 };

        const timeline = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: section,
            start: () => `top ${headerOffset()}px`,
            end: () => `+=${window.innerHeight * (stacked ? 1 : 1.25)}`,
            pin,
            scrub: 1,
            anticipatePin: 1,
            invalidateOnRefresh: true,
          },
        });

        timeline
          // Explicit, same-shaped start and end strings: browsers normalise computed clip-paths.
          .fromTo("[data-hero-media]", { clipPath: () => measureArch(pin, stacked) }, { clipPath: FULL_CLIP, duration: 1, ease: "power2.inOut" }, 0)
          .fromTo("[data-hero-video]", { scale: 1.16 }, { scale: 1, duration: 1, ease: "power1.out" }, 0)
          // The words leave well before the widening arch can reach them.
          .fromTo("[data-hero-word='left']", { xPercent: 0, yPercent: 0, opacity: 1 }, { ...inward, opacity: 0, duration: 0.38, ease: "power2.in" }, 0)
          .fromTo("[data-hero-word='right']", { xPercent: 0, yPercent: 0, opacity: 1 }, { ...outward, opacity: 0, duration: 0.38, ease: "power2.in" }, 0)
          .fromTo("[data-hero-fade]", { opacity: 1, y: 0 }, { opacity: 0, y: 20, duration: 0.22, ease: "power1.in" }, 0)
          .fromTo("[data-hero-shade]", { opacity: 0 }, { opacity: 1, duration: 0.5 }, 0.45)
          .to("[data-statement-label]", { autoAlpha: 1, y: 0, duration: 0.25, ease: "power2.out" }, 0.62)
          .to("[data-statement-line]", { yPercent: 0, duration: 0.35, stagger: 0.08, ease: "power3.out" }, 0.66)
          // A short hold so the statement can be read before the page moves on.
          .to({}, { duration: 0.3 });

        return () => {
          window.clearTimeout(revealTimer);
          document.removeEventListener("visibilitychange", revealOnReturn);
        };
      });
    }, section);

    return () => {
      observer?.disconnect();
      media.revert();
      context.revert();
      pin.style.removeProperty("--arch-w");
    };
  }, []);

  return (
    <section className="xp-hero" ref={root} aria-labelledby="hero-title" data-chapter="awakening">
      <div className="xp-hero-pin" data-hero-pin>
        <div className="xp-hero-media" data-hero-media>
          <video
            ref={videoRef}
            className="xp-hero-video"
            data-hero-video
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            poster="/media/hero-espresso-poster.webp"
            aria-hidden="true"
          >
            <source src="/media/hero-espresso-portrait.mp4" type="video/mp4" media="(max-width: 760px)" />
            <source src="/media/hero-espresso.mp4" type="video/mp4" />
          </video>
          <div className="xp-hero-shade" data-hero-shade aria-hidden="true" />
          <div className="xp-hero-statement" data-hero-statement>
            <span className="xp-label" data-statement-label>Daymark Coffee</span>
            <p>
              <span className="xp-mask"><span data-statement-line>Good coffee, made</span></span>{" "}
              <span className="xp-mask"><span data-statement-line>one step <em>at a time.</em></span></span>
            </p>
          </div>
        </div>

        <h1 id="hero-title" className="xp-hero-title">
          {/* Four words flank the arch; DOM order keeps the sentence readable. */}
          <span className="xp-hero-word xp-hero-word--a" data-hero-word="left">
            <span className="xp-mask"><span data-hero-line>First</span></span>
          </span>{" "}
          <span className="xp-hero-word xp-hero-word--b" data-hero-word="right">
            <span className="xp-mask"><span data-hero-line>things</span></span>
          </span>{" "}
          <span className="xp-hero-word xp-hero-word--c" data-hero-word="left">
            <span className="xp-mask"><span data-hero-line>first:</span></span>
          </span>{" "}
          <span className="xp-hero-word xp-hero-word--d" data-hero-word="right">
            <span className="xp-mask"><span data-hero-line><em>coffee.</em></span></span>
          </span>
        </h1>

        <div className="xp-hero-intro" data-hero-fade>
          <p>A steady pour, a warm cup, then whatever the day brings.</p>
          <div className="xp-hero-actions">
            <a className="button button-dark" href="/menu">See the menu <ArrowIcon direction="up-right" /></a>
            <a className="xp-link" href="#ritual">How it&rsquo;s made <ArrowIcon direction="down-right" /></a>
          </div>
        </div>

        <div className="xp-hero-cue" data-hero-fade aria-hidden="true">
          <span>Scroll</span>
          <i />
        </div>

        <div className="xp-hero-seal" data-hero-fade aria-hidden="true">
          <svg viewBox="0 0 120 120">
            <defs><path id="hero-seal-arc" d="M60,60 m-44,0 a44,44 0 1,1 88,0 a44,44 0 1,1 -88,0" /></defs>
            <text><textPath href="#hero-seal-arc">GOOD COFFEE · NO RUSH · GOOD COFFEE · NO RUSH · </textPath></text>
          </svg>
          <BeanMark className="xp-hero-seal-bean" />
        </div>
      </div>
    </section>
  );
}
