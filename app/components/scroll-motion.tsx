"use client";

import { useEffect, useLayoutEffect, useRef, type ReactNode } from "react";
import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { getLenis, setLenis } from "./smooth-scroll";

/** Children of a reveal block that should fade in, skipping (and digging around) split headings. */
function revealPieces(element: Element): HTMLElement[] {
  return Array.from(element.children).flatMap((child) => {
    if (!(child instanceof HTMLElement) || child.matches("[data-split]")) return [];
    return child.querySelector("[data-split]") ? revealPieces(child) : [child];
  });
}

const useIsomorphicLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

export function ScrollMotion({ children }: { children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null);

  useIsomorphicLayoutEffect(() => {
    if (!root.current) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const navigation = window.performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined;
    const isHardReload = navigation?.type === "reload";
    const initialHash = window.location.hash;
    const previousScrollRestoration = window.history.scrollRestoration;
    let restoreScrollOnLoad: (() => void) | undefined;
    const resetReloadPosition = () => {
      if (!isHardReload) return;

      if (initialHash && window.location.hash === initialHash) {
        window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}`);
      }

      const documentElement = document.documentElement;
      const previousScrollBehavior = documentElement.style.scrollBehavior;
      documentElement.style.scrollBehavior = "auto";
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
      window.requestAnimationFrame(() => {
        window.scrollTo({ top: 0, left: 0, behavior: "auto" });
        documentElement.style.scrollBehavior = previousScrollBehavior;
      });
    };
    const alignInitialHash = () => {
      if (isHardReload || !initialHash || window.location.hash !== initialHash) return;

      const target = document.getElementById(decodeURIComponent(initialHash.slice(1)));
      if (!target) return;

      const documentElement = document.documentElement;
      const previousScrollBehavior = documentElement.style.scrollBehavior;
      const scrollPadding = Number.parseFloat(getComputedStyle(documentElement).scrollPaddingTop) || 0;
      const targetTop = Math.max(0, target.getBoundingClientRect().top + window.scrollY - scrollPadding);
      documentElement.style.scrollBehavior = "auto";
      window.scrollTo({ top: targetTop, left: 0, behavior: "auto" });
      documentElement.style.scrollBehavior = previousScrollBehavior;
    };
    const handleHashClick = (event: MouseEvent) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) return;

      const source = event.target;
      if (!(source instanceof Element)) return;
      const anchor = source.closest<HTMLAnchorElement>('a[href^="#"]');
      if (!anchor || (anchor.target && anchor.target !== "_self")) return;

      const hash = anchor.getAttribute("href");
      if (!hash || hash.length < 2) return;

      const target = document.getElementById(decodeURIComponent(hash.slice(1)));
      if (!target) return;

      event.preventDefault();
      if (window.location.hash !== hash) window.history.pushState(null, "", hash);

      const documentElement = document.documentElement;
      const scrollPadding = Number.parseFloat(getComputedStyle(documentElement).scrollPaddingTop) || 0;
      const targetTop = Math.max(0, target.getBoundingClientRect().top + window.scrollY - scrollPadding);
      // Glide with Lenis when it's running; otherwise fall back to the browser.
      const lenis = getLenis();
      if (lenis) lenis.scrollTo(targetTop, { duration: 1.4 });
      else window.scrollTo({ top: targetTop, left: 0, behavior: reducedMotion ? "auto" : "smooth" });
    };

    document.addEventListener("click", handleHashClick);

    if (isHardReload) {
      window.history.scrollRestoration = "manual";
      resetReloadPosition();
      restoreScrollOnLoad = () => {
        resetReloadPosition();
        window.requestAnimationFrame(() => {
          resetReloadPosition();
          window.history.scrollRestoration = previousScrollRestoration;
        });
      };

      if (document.readyState === "complete") {
        restoreScrollOnLoad();
      } else {
        window.addEventListener("load", restoreScrollOnLoad, { once: true });
      }
    }

    if (reducedMotion) {
      if (!isHardReload) alignInitialHash();
      root.current.querySelectorAll<HTMLVideoElement>("[data-autoplay-video]").forEach((video) => video.pause());
      return () => {
        document.removeEventListener("click", handleHashClick);
        if (restoreScrollOnLoad) window.removeEventListener("load", restoreScrollOnLoad);
        window.history.scrollRestoration = previousScrollRestoration;
      };
    }

    gsap.registerPlugin(ScrollTrigger, SplitText);

    // Smooth, weighted wheel/trackpad scrolling. GSAP's ticker drives Lenis so every
    // ScrollTrigger (pins, scrubs, snaps) reads the same smoothed position each frame.
    // Touch keeps native scrolling (syncTouch off); the browser still owns the scrollbar.
    const lenis = new Lenis({
      autoRaf: false,
      // 0.12 keeps the glide soft but trims its slow tail, so chapter snaps start sooner.
      lerp: 0.12,
      smoothWheel: true,
      syncTouch: false,
      anchors: false, // hash links are handled above so they respect the header offset
      allowNestedScroll: true,
      stopInertiaOnNavigate: true,
    });
    const onLenisScroll = () => ScrollTrigger.update();
    lenis.on("scroll", onLenisScroll);
    const tickLenis = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tickLenis);
    gsap.ticker.lagSmoothing(0);
    setLenis(lenis);

    const media = gsap.matchMedia();
    // Entrance tweens start content hidden; if the browser throttles frames, finish them so nothing stays blank.
    const entrance: gsap.core.Tween[] = [];
    const finishEntrance = () => entrance.forEach((tween) => { if (tween.progress() < 1) tween.progress(1); });
    const entranceTimer = window.setTimeout(finishEntrance, 2600);
    const finishOnReturn = () => { if (document.visibilityState === "visible") finishEntrance(); };
    document.addEventListener("visibilitychange", finishOnReturn);
    const splits: SplitText[] = [];
    const tickerCleanups: Array<() => void> = [];
    const context = gsap.context(() => {
      // Guard every selector-based tween: pages that lack a target would otherwise log GSAP warnings.
      const heroItems = gsap.utils.toArray<HTMLElement>("[data-hero-reveal]");
      if (heroItems.length) {
        entrance.push(gsap.fromTo(
          heroItems,
          { autoAlpha: 0, y: 20 },
          { autoAlpha: 1, y: 0, duration: 0.78, stagger: 0.11, ease: "power3.out", delay: 0.08 },
        ));
      }

      const progress = root.current?.querySelector<HTMLElement>(".scroll-progress__bar");
      if (progress) {
        gsap.to(progress, {
          scaleX: 1,
          ease: "none",
          scrollTrigger: { trigger: document.documentElement, start: "top top", end: "bottom bottom", scrub: 0.35 },
        });
      }

      // Section headings rise line by line from behind a mask. autoSplit re-splits once the
      // display font has loaded (and on resize), so line breaks always match the real text.
      gsap.utils.toArray<HTMLElement>("[data-split]").forEach((heading) => {
        splits.push(SplitText.create(heading, {
          type: "lines",
          mask: "lines",
          linesClass: "xp-split-line",
          autoSplit: true,
          onSplit: (self) => gsap.from(self.lines, {
            yPercent: 112,
            rotate: 2.2,
            transformOrigin: "0% 100%",
            duration: 1.15,
            stagger: 0.1,
            ease: "expo.out",
            scrollTrigger: { trigger: heading, start: "top 88%", once: true },
          }),
        }));
      });

      gsap.utils.toArray<HTMLElement>("[data-reveal]").forEach((element) => {
        // A block that holds a split heading lets the heading animate itself and staggers the rest.
        const targets = element.querySelector("[data-split]") ? revealPieces(element) : [element];
        if (!targets.length) return;
        gsap.fromTo(
          targets,
          { autoAlpha: 0, y: 22 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.8,
            stagger: 0.08,
            ease: "power2.out",
            delay: targets.length > 1 ? 0.15 : 0,
            scrollTrigger: { trigger: element, start: "top 88%", once: true },
          },
        );
      });

      // Photo frames, "developing print": the frame glides up into place as a warm, empty tile,
      // then the photo develops into it — fading in while it settles by a barely-there 4%.
      // No wipes, no pops: long, decelerating eases and a gentle stagger between neighbours.
      gsap.utils.toArray<HTMLElement>("[data-frame]").forEach((frame, index) => {
        const inner = frame.querySelector<HTMLElement>("[data-parallax-inner]");
        const timeline = gsap.timeline({
          delay: (Number(frame.dataset.frame) || index % 3) * 0.14,
          scrollTrigger: { trigger: frame, start: "top 90%", once: true },
        });
        timeline.fromTo(
          frame,
          { autoAlpha: 0, y: 56 },
          { autoAlpha: 1, y: 0, duration: 1.4, ease: "expo.out" },
        );
        if (inner) {
          timeline.fromTo(
            inner,
            { opacity: 0, scale: 1.04 },
            { opacity: 1, scale: 1, duration: 1.8, ease: "power2.out" },
            0.25,
          );
        }
        // Captions arrive last, once there is a picture behind them.
        const captions = frame.querySelectorAll<HTMLElement>("figcaption, .connection-image-caption");
        if (captions.length) {
          timeline.fromTo(captions, { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, duration: 0.9, ease: "power3.out" }, 0.75);
        }
      });

      // Photos drift inside their frames while scrolling (the wrapper is taller than the frame).
      gsap.utils.toArray<HTMLElement>("[data-parallax-inner]").forEach((inner) => {
        const frame = inner.parentElement ?? inner;
        gsap.fromTo(
          inner,
          { yPercent: -6 },
          { yPercent: 6, ease: "none", scrollTrigger: { trigger: frame, start: "top bottom", end: "bottom top", scrub: 0.6 } },
        );
      });

      // Lists whose row dividers draw in from the left as the rows arrive.
      gsap.utils.toArray<HTMLElement>("[data-draw-lines]").forEach((list) => {
        const rows = Array.from(list.children) as HTMLElement[];
        if (!rows.length) return;
        gsap.fromTo(
          rows,
          { "--draw": 0 },
          {
            "--draw": 1,
            duration: 1.1,
            stagger: 0.08,
            ease: "expo.inOut",
            scrollTrigger: { trigger: list, start: "top 86%", once: true },
          },
        );
      });

      // Closing dark sheet: it slides up over the page at full width (rounded top edge, set in
      // CSS), while its contents trail slightly behind, so the words settle as the sheet arrives.
      gsap.utils.toArray<HTMLElement>("[data-rise]").forEach((section) => {
        const layers = Array.from(section.children) as HTMLElement[];
        layers.forEach((layer, index) => {
          // yPercent (not y), so it stacks with the fade-up that [data-reveal] runs on `y`.
          const offset = () => ((110 + index * 50) / Math.max(layer.offsetHeight, 1)) * 100;
          gsap.fromTo(
            layer,
            { yPercent: offset },
            {
              yPercent: 0,
              ease: "none",
              immediateRender: true,
              scrollTrigger: { trigger: section, start: "top bottom", end: "top 35%", scrub: 0.8, invalidateOnRefresh: true },
            },
          );
        });
      });

      // Marquee: a GSAP loop whose speed and direction follow the scroll, with a slight lean.
      gsap.utils.toArray<HTMLElement>("[data-marquee]").forEach((marquee) => {
        const track = marquee.querySelector<HTMLElement>(".xp-marquee-track");
        if (!track) return;
        marquee.classList.add("is-driven");
        const loop = gsap.to(track, { xPercent: -50, duration: 46, ease: "none", repeat: -1 });
        loop.totalTime(46 * 200); // far from zero, so playing in reverse never hits the start
        const skewTo = gsap.quickTo(track, "skewX", { duration: 0.6, ease: "power3" });
        let visible = false;
        let direction = 1;
        let speed = 1;
        let fallbackVelocity = 0;
        const watch = ScrollTrigger.create({
          trigger: marquee,
          start: "top bottom",
          end: "bottom top",
          onToggle: (self) => { visible = self.isActive; if (visible) loop.resume(); else loop.pause(); },
          onUpdate: (self) => { fallbackVelocity = self.getVelocity() / 700; direction = self.direction; },
        });
        if (!watch.isActive) loop.pause();
        const tick = () => {
          if (!visible) return;
          const lenisNow = getLenis();
          const velocity = lenisNow ? lenisNow.velocity / 9 : fallbackVelocity;
          fallbackVelocity *= 0.9; // touch scrolling reports no velocity once it stops
          if (lenisNow && lenisNow.direction) direction = lenisNow.direction;
          const target = direction * (1 + Math.min(Math.abs(velocity) * 1.6, 7));
          speed += (target - speed) * 0.07;
          loop.timeScale(speed);
          skewTo(gsap.utils.clamp(-5, 5, -velocity * 1.2));
        };
        gsap.ticker.add(tick);
        tickerCleanups.push(() => gsap.ticker.remove(tick));
      });

      // Mouse users: buttons lean gently toward the cursor. Uses the CSS `translate` property
      // through custom properties, so it stacks with each button's own hover lift.
      media.add("(hover: hover) and (pointer: fine)", () => {
        const removers: Array<() => void> = [];
        root.current?.querySelectorAll<HTMLElement>(".button, .header-cta").forEach((button) => {
          const state = { x: 0, y: 0 };
          const apply = () => {
            button.style.setProperty("--mx", `${state.x.toFixed(2)}px`);
            button.style.setProperty("--my", `${state.y.toFixed(2)}px`);
          };
          const xTo = gsap.quickTo(state, "x", { duration: 0.55, ease: "power3", onUpdate: apply });
          const yTo = gsap.quickTo(state, "y", { duration: 0.55, ease: "power3", onUpdate: apply });
          const move = (event: PointerEvent) => {
            const rect = button.getBoundingClientRect();
            xTo(gsap.utils.clamp(-10, 10, (event.clientX - (rect.left + rect.width / 2)) * 0.22));
            yTo(gsap.utils.clamp(-7, 7, (event.clientY - (rect.top + rect.height / 2)) * 0.3));
          };
          const leave = () => { xTo(0); yTo(0); };
          button.addEventListener("pointermove", move);
          button.addEventListener("pointerleave", leave);
          removers.push(() => {
            button.removeEventListener("pointermove", move);
            button.removeEventListener("pointerleave", leave);
            button.style.removeProperty("--mx");
            button.style.removeProperty("--my");
          });
        });
        return () => removers.forEach((remove) => remove());
      });

      gsap.utils.toArray<HTMLElement>("[data-reveal-group]").forEach((group) => {
        const items = Array.from(group.querySelectorAll<HTMLElement>("[data-reveal-item]"));
        if (!items.length) return;

        gsap.fromTo(
          items,
          { autoAlpha: 0, y: 18 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.64,
            stagger: 0.1,
            ease: "power2.out",
            scrollTrigger: { trigger: group, start: "top 86%", once: true },
          },
        );
      });

      gsap.utils.toArray<HTMLElement>("[data-image-reveal]").forEach((element) => {
        const image = element.querySelector("img");
        if (!image) return;
        gsap.fromTo(
          image,
          { scale: 1.1 },
          {
            scale: 1,
            duration: 1.05,
            ease: "power2.out",
            scrollTrigger: { trigger: element, start: "top 85%", once: true },
          },
        );
      });

      const heroImage = root.current?.querySelector<HTMLElement>("[data-hero-image]");
      if (heroImage) {
        entrance.push(gsap.fromTo(
          heroImage,
          { clipPath: "inset(100% 0% 0% 0%)", scale: 1.035 },
          { clipPath: "inset(0% 0% 0% 0%)", scale: 1, duration: 1.3, ease: "expo.inOut", delay: 0.12 },
        ));

        // Inner-page heroes: the detail card glides in after the photo, then photo and card
        // drift at different speeds while scrolling for a sense of depth.
        const floatCard = root.current?.querySelector<HTMLElement>("[data-float-card]");
        const parallaxMedia = heroImage.querySelector<HTMLElement>("[data-parallax]");
        if (floatCard) {
          entrance.push(gsap.fromTo(floatCard, { autoAlpha: 0, y: 44 }, { autoAlpha: 1, y: 0, duration: 1.1, ease: "expo.out", delay: 0.75 }));
        }
        media.add("(min-width: 900px)", () => {
          const scrollTrigger = { trigger: heroImage, start: "top top", end: "bottom top", scrub: 0.8 };
          if (parallaxMedia) gsap.fromTo(parallaxMedia, { yPercent: 0, scale: 1.08 }, { yPercent: 8, scale: 1.08, ease: "none", scrollTrigger });
          if (floatCard) gsap.to(floatCard, { yPercent: -28, ease: "none", scrollTrigger });
        });
      }

      // Hero clips respect reduced motion via the early return above; pause them off-screen.
      gsap.utils.toArray<HTMLVideoElement>("[data-autoplay-video]").forEach((video) => {
        ScrollTrigger.create({
          trigger: video,
          start: "top bottom",
          end: "bottom top",
          onToggle: (self) => (self.isActive ? void video.play().catch(() => undefined) : video.pause()),
        });
      });

      media.add("(min-width: 761px)", () => {
        const moment = root.current?.querySelector<HTMLElement>("#moment");
        const momentGhost = moment?.querySelector<HTMLElement>(".moment-ghost");
        if (moment && momentGhost) {
          gsap.fromTo(
            momentGhost,
            { x: 50 },
            {
              x: -45,
              ease: "none",
              scrollTrigger: { trigger: moment, start: "top bottom", end: "bottom top", scrub: 0.7 },
            },
          );
        }

      });

      media.add("(max-width: 760px)", () => {
        const steps = gsap.utils.toArray<HTMLElement>("[data-ritual-step]");
        steps.forEach((step) => {
          gsap.fromTo(
            step,
            { autoAlpha: 0, y: 24 },
            {
              autoAlpha: 1,
              y: 0,
              duration: 0.75,
              ease: "power2.out",
              scrollTrigger: { trigger: step, start: "top 88%", once: true },
            },
          );
        });
      });
    }, root);

    if (isHardReload) {
      ScrollTrigger.refresh();
      resetReloadPosition();
    } else if (initialHash) {
      ScrollTrigger.refresh();
      alignInitialHash();
    }

    return () => {
      gsap.ticker.remove(tickLenis);
      gsap.ticker.lagSmoothing(500, 33);
      lenis.off("scroll", onLenisScroll);
      lenis.destroy();
      setLenis(null);
      window.clearTimeout(entranceTimer);
      document.removeEventListener("visibilitychange", finishOnReturn);
      document.removeEventListener("click", handleHashClick);
      if (restoreScrollOnLoad) window.removeEventListener("load", restoreScrollOnLoad);
      window.history.scrollRestoration = previousScrollRestoration;
      tickerCleanups.forEach((cleanup) => cleanup());
      media.revert();
      context.revert();
      // Put the original heading markup back (also keeps Fast Refresh from double-splitting).
      splits.forEach((split) => split.revert());
    };
  }, []);

  return (
    <div ref={root}>
      <div className="scroll-progress" aria-hidden="true"><span className="scroll-progress__bar" /></div>
      {children}
    </div>
  );
}
