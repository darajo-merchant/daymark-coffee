"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { getLenis } from "./smooth-scroll";

const useIsomorphicLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

/** Pinned scenes sit just below the sticky header. */
export const headerOffset = () => document.querySelector<HTMLElement>(".site-header")?.offsetHeight ?? 0;

type Chapter = {
  number: string;
  tag: string;
  kicker: string;
  title: React.ReactNode;
  copy: string;
  video?: string;
  image: string;
  alt: string;
};

const chapters: Chapter[] = [
  {
    number: "01",
    tag: "Bean",
    kicker: "The whole bean",
    title: <>It starts with{" "}<br />the <em>bean.</em></>,
    copy: "Long before the pour, there is the bean. Its variety and origin shape everything that follows.",
    video: "/media/bean.mp4",
    image: "/media/bean-poster.webp",
    alt: "Close-up of roasted coffee beans in warm, low light",
  },
  {
    number: "02",
    tag: "Roast",
    kicker: "The roast",
    title: <>Heat, time,{" "}<br /><em>patience.</em></>,
    copy: "As the roaster turns, heat draws out the aromas that carry all the way to the cup.",
    video: "/media/roast.mp4",
    image: "/media/roast-poster.webp",
    alt: "Freshly roasted beans spilling from a drum roaster",
  },
  {
    number: "03",
    tag: "Grind",
    kicker: "The grind",
    title: <>Set the{" "}<br /><em>grind.</em></>,
    copy: "Freshly ground coffee fills the portafilter, ready for hot water to pass through it.",
    image: "/images/journey/03-grinding.webp",
    alt: "Fresh coffee grounds falling into a portafilter",
  },
  {
    number: "04",
    tag: "Pour",
    kicker: "The first pour",
    title: <>Let it{" "}<br /><em>pour.</em></>,
    copy: "A fine stream of espresso gathers slowly. This is where the waiting pays off.",
    video: "/media/pour.mp4",
    image: "/media/pour-poster.webp",
    alt: "Two streams of espresso falling from a portafilter",
  },
  {
    number: "05",
    tag: "Cup",
    kicker: "Your cup",
    title: <>Then, it&rsquo;s{" "}<br /><em>yours.</em></>,
    copy: "Steamed milk, a steady hand, and a cup made for this moment of your day.",
    video: "/media/latte.mp4",
    image: "/media/latte-poster.webp",
    alt: "Latte art taking shape as milk is poured into espresso",
  },
];

export function ProcessStory() {
  const root = useRef<HTMLElement>(null);
  const [active, setActive] = useState(0);
  const [pinned, setPinned] = useState(false);
  const [inView, setInView] = useState(false);
  // True while a rail button is gliding to a chapter, so the snap doesn't interrupt it.
  const jumping = useRef(false);

  useIsomorphicLayoutEffect(() => {
    const section = root.current;
    if (!section) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    gsap.registerPlugin(ScrollTrigger);
    // Switch to the stacked, full-screen layout before measuring the pin.
    section.classList.replace("is-static", "is-pinned");
    setPinned(true);

    const context = gsap.context(() => {
      const scenes = gsap.utils.toArray<HTMLElement>("[data-scene]");
      const copies = gsap.utils.toArray<HTMLElement>("[data-scene-copy]");
      const steps = scenes.length - 1;

      const items = (copy: HTMLElement) => copy.querySelectorAll<HTMLElement>("[data-copy-item]");
      copies.slice(1).forEach((copy) => gsap.set(items(copy), { autoAlpha: 0, y: 48, filter: "blur(10px)" }));

      const timeline = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: section,
          start: () => `top ${headerOffset()}px`,
          end: () => `+=${window.innerHeight * steps * 0.9}`,
          pin: "[data-story-stage]",
          scrub: 1,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          snap: {
            // Settle on a whole chapter: stay put when already close to one, otherwise follow the scroll direction.
            // Fallback snap for when Lenis isn't running; with Lenis the effect below snaps sooner.
            // `value` is velocity-projected, so returning it would still move the page;
            // return the real current progress to make this a true no-op.
            snapTo: (value: number, self?: ScrollTrigger) => {
              if (jumping.current || getLenis()) return self?.progress ?? value;
              const position = value * steps;
              const nearest = Math.round(position);
              if (Math.abs(position - nearest) < 0.08) return nearest / steps;
              const next = (self?.direction ?? 1) > 0 ? Math.ceil(position) : Math.floor(position);
              return next / steps;
            },
            duration: { min: 0.35, max: 0.8 },
            delay: 0.04,
            inertia: false,
            ease: "power2.inOut",
          },
          onUpdate: (self) => setActive(Math.min(steps, Math.round(self.progress * steps))),
        },
      });

      timeline.addLabel("scene-0", 0);
      for (let index = 1; index <= steps; index += 1) {
        const at = index - 1;
        // Each new scene rises like a card with rounded shoulders while the last one sinks back into shadow.
        timeline
          .fromTo(
            scenes[index],
            { clipPath: "inset(100% 5% 0% 5% round 56px 56px 0px 0px)" },
            { clipPath: "inset(0% 0% 0% 0% round 0px 0px 0px 0px)", duration: 1, ease: "power3.inOut" },
            at,
          )
          .fromTo(scenes[index].querySelector("[data-scene-media]"), { scale: 1.28, yPercent: 10 }, { scale: 1.02, yPercent: 0, duration: 1, ease: "power2.out" }, at)
          .to(scenes[index - 1].querySelector("[data-scene-media]"), { scale: 0.9, yPercent: -5, duration: 1, ease: "power2.inOut" }, at)
          .fromTo(scenes[index - 1].querySelector("[data-scene-dim]"), { opacity: 0 }, { opacity: 0.78, duration: 1, ease: "power1.in" }, at)
          .to(items(copies[index - 1]), { autoAlpha: 0, y: -36, filter: "blur(8px)", duration: 0.32, stagger: 0.03, ease: "power2.in" }, at)
          .to(items(copies[index]), { autoAlpha: 1, y: 0, filter: "blur(0px)", duration: 0.42, stagger: 0.06, ease: "power3.out" }, at + 0.48)
          .addLabel(`scene-${index}`, at + 1);
      }
      // The CSS turns --fill into a vertical (desktop) or horizontal (mobile) pour.
      timeline.fromTo("[data-stream-fill]", { "--fill": 0 }, { "--fill": 1, duration: steps, ease: "none" }, 0);
    }, section);

    return () => {
      context.revert();
      section.classList.replace("is-pinned", "is-static");
      setPinned(false);
    };
  }, []);

  // With Lenis, snap as soon as the wheel glide slows down instead of waiting for its
  // long pixel-by-pixel tail to stop. (Passive effects run after ScrollMotion has created Lenis.)
  useEffect(() => {
    const lenis = getLenis();
    const section = root.current;
    if (!lenis || !section) return;

    const steps = chapters.length - 1;
    let wasMoving = false;
    let snapping = false;
    let releaseTimer = 0;
    const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

    const onScroll = () => {
      if (jumping.current || snapping) return;
      const trigger = ScrollTrigger.getAll().find((item) => item.trigger === section);
      if (!trigger?.isActive) { wasMoving = false; return; }

      const speed = Math.abs(lenis.velocity);
      if (speed > 3) { wasMoving = true; return; }
      if (!wasMoving || speed > 1.2) return;

      // The glide is fading out: pick the chapter, following the scroll direction.
      wasMoving = false;
      const span = trigger.end - trigger.start;
      const position = ((lenis.scroll - trigger.start) / span) * steps;
      const nearest = Math.round(position);
      const chapter = Math.abs(position - nearest) < 0.04
        ? nearest
        : lenis.direction > 0 ? Math.ceil(position) : Math.floor(position);
      const target = trigger.start + (span * Math.min(steps, Math.max(0, chapter))) / steps;
      if (Math.abs(target - lenis.scroll) < 2) return;

      snapping = true;
      const release = () => { snapping = false; window.clearTimeout(releaseTimer); };
      // Fallback release in case a new wheel gesture interrupts the glide before it completes.
      releaseTimer = window.setTimeout(release, 1200);
      lenis.scrollTo(target, { duration: 0.75, easing: easeInOut, onComplete: release });
    };

    lenis.on("scroll", onScroll);
    return () => {
      lenis.off("scroll", onScroll);
      window.clearTimeout(releaseTimer);
    };
  }, []);

  // Play only the clip that is on screen; pause everything else.
  useEffect(() => {
    const section = root.current;
    if (!section) return;
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { threshold: 0.15 });
    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const section = root.current;
    if (!section) return;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    section.querySelectorAll<HTMLVideoElement>("video").forEach((video) => {
      const index = Number(video.dataset.index);
      const shouldPlay = !reducedMotion && inView && (pinned ? index === active : true);
      if (shouldPlay) void video.play().catch(() => undefined);
      else video.pause();
    });
  }, [active, inView, pinned]);

  const jumpTo = (index: number) => {
    const trigger = ScrollTrigger.getAll().find((item) => item.trigger === root.current);
    if (!trigger) {
      document.getElementById(`chapter-${chapters[index].number}`)?.scrollIntoView({ behavior: "auto" });
      return;
    }
    // Glide exactly onto the chapter label with the snap paused, so nothing can redirect the jump.
    const target = Math.ceil(trigger.labelToScroll(`scene-${index}`));
    jumping.current = true;

    const lenis = getLenis();
    if (lenis) {
      // Lenis glides there and tells us exactly when it has arrived.
      lenis.scrollTo(target, {
        duration: Math.min(1.8, 0.8 + Math.abs(window.scrollY - target) / 3000),
        onComplete: () => { jumping.current = false; },
      });
      window.setTimeout(() => { jumping.current = false; }, 4000);
      return;
    }

    const release = () => {
      jumping.current = false;
      window.removeEventListener("scrollend", release);
      window.clearTimeout(fallback);
    };
    // scrollend marks the glide's end; the timeout covers browsers without that event.
    const fallback = window.setTimeout(release, 4000);
    window.addEventListener("scrollend", release);
    window.scrollTo({ top: target, behavior: "smooth" });
  };

  return (
    <section
      ref={root}
      className={`xp-story ${pinned ? "is-pinned" : "is-static"}`}
      id="ritual"
      aria-labelledby="ritual-title"
      data-chapter="craft"
    >
      <div className="xp-story-stage" data-story-stage>
        <h2 id="ritual-title" className="xp-visually-hidden">From bean to cup, in five steps</h2>

        {chapters.map((chapter, index) => (
          <article
            className="xp-scene"
            key={chapter.number}
            id={`chapter-${chapter.number}`}
            data-scene
            aria-label={`Step ${index + 1} of ${chapters.length}: ${chapter.kicker}`}
          >
            <div className="xp-scene-media" data-scene-media>
              {chapter.video ? (
                <video
                  data-index={index}
                  src={chapter.video}
                  poster={chapter.image}
                  muted
                  loop
                  playsInline
                  preload={index < 2 ? "auto" : "metadata"}
                  aria-label={chapter.alt}
                />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={chapter.image} alt={chapter.alt} loading="lazy" />
              )}
            </div>
            <div className="xp-scene-shade" aria-hidden="true" />
            <div className="xp-scene-dim" data-scene-dim aria-hidden="true" />
            <div className="xp-scene-copy" data-scene-copy>
              <span className="xp-scene-number" aria-hidden="true" data-copy-item>{chapter.number}</span>
              <p className="xp-label" data-copy-item>{chapter.number} / {chapter.kicker}</p>
              <h3 data-copy-item>{chapter.title}</h3>
              <p className="xp-scene-text" data-copy-item>{chapter.copy}</p>
            </div>
          </article>
        ))}

        <div className="xp-story-head" aria-hidden={pinned ? undefined : true}>
          <span className="xp-label">From bean to cup</span>
        </div>

        <nav className="xp-story-rail" aria-label="Coffee process steps">
          <div className="xp-stream" aria-hidden="true">
            <span className="xp-stream-track" />
            <span className="xp-stream-fill" data-stream-fill />
          </div>
          <ol>
            {chapters.map((chapter, index) => (
              <li key={chapter.number} className={pinned && index <= active ? (index === active ? "is-active" : "is-done") : ""}>
                <button
                  type="button"
                  onClick={() => jumpTo(index)}
                  aria-current={pinned && index === active ? "step" : undefined}
                >
                  <span className="xp-rail-dot" aria-hidden="true" />
                  <span className="xp-rail-number">{chapter.number}</span>
                  <span className="xp-rail-tag">{chapter.tag}</span>
                </button>
              </li>
            ))}
          </ol>
        </nav>

        <div className="xp-grain" aria-hidden="true" />
      </div>
    </section>
  );
}
