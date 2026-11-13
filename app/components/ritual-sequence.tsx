"use client";

import { useCallback, useEffect, useRef, useState, type KeyboardEvent as ReactKeyboardEvent, type WheelEvent as ReactWheelEvent } from "react";
import Image from "next/image";

const journey = [
  {
    number: "01",
    shortName: "BEAN",
    name: "THE WHOLE BEAN",
    title: <>First, the<br /><em>bean.</em></>,
    copy: "Long before the pour, there is the bean. Its variety and origin shape what follows.",
    image: "/images/journey/01-whole-bean.webp",
    alt: "A single roasted coffee bean against a deep, dark background",
    note: "THE BEAN",
  },
  {
    number: "02",
    shortName: "ROAST",
    name: "THE ROAST",
    title: <>Heat and<br /><em>time.</em></>,
    copy: "As the roaster turns, heat draws out the aromas that carry through the cup.",
    image: "/images/journey/02-roasting.webp",
    alt: "Freshly roasted coffee beans tumbling from a warm, glowing roaster",
    note: "IN THE ROASTER",
  },
  {
    number: "03",
    shortName: "GRIND",
    name: "THE GRIND",
    title: <>Set the<br /><em>grind.</em></>,
    copy: "Freshly ground coffee fills the portafilter, ready for water to pass through it.",
    image: "/images/journey/03-grinding.webp",
    alt: "Fresh coffee grounds falling into a portafilter",
    note: "READY FOR THE PORTAFILTER",
  },
  {
    number: "04",
    shortName: "BREW",
    name: "THE FIRST POUR",
    title: <>Into the<br /><em>cup.</em></>,
    copy: "A fine stream of espresso gathers in the cup. That’s when the waiting pays off.",
    image: "/images/journey/04-espresso.webp",
    alt: "A stream of espresso flowing into a white ceramic cup",
    note: "THE FIRST ESPRESSO",
  },
];

export function RitualSequence() {
  const slidesRef = useRef<HTMLDivElement>(null);
  const programmaticScroll = useRef(false);
  const programmaticScrollTimer = useRef<number | null>(null);
  const skipFocusPause = useRef(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const activeStep = journey[activeIndex];

  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(preference.matches);
    setIsPlaying(!preference.matches);

    const updatePreference = (event: MediaQueryListEvent) => {
      setReducedMotion(event.matches);
      if (event.matches) setIsPlaying(false);
    };
    preference.addEventListener("change", updatePreference);
    return () => preference.removeEventListener("change", updatePreference);
  }, []);

  useEffect(() => () => {
    if (programmaticScrollTimer.current !== null) window.clearTimeout(programmaticScrollTimer.current);
  }, []);

  const goToStep = useCallback((index: number) => {
    const slides = slidesRef.current;
    if (!slides) return;

    programmaticScroll.current = true;
    if (programmaticScrollTimer.current !== null) window.clearTimeout(programmaticScrollTimer.current);
    programmaticScrollTimer.current = window.setTimeout(() => {
      programmaticScroll.current = false;
      programmaticScrollTimer.current = null;
    }, 900);
    slides.scrollTo({
      left: index * slides.clientWidth,
      behavior: reducedMotion ? "auto" : "smooth",
    });
  }, [reducedMotion]);

  useEffect(() => {
    if (!isPlaying || isHovered || reducedMotion) return;

    const timer = window.setTimeout(() => {
      goToStep((activeIndex + 1) % journey.length);
    }, 7000);
    return () => window.clearTimeout(timer);
  }, [activeIndex, goToStep, isHovered, isPlaying, reducedMotion]);

  const handleScroll = () => {
    const slides = slidesRef.current;
    if (!slides?.clientWidth) return;

    const nextIndex = Math.max(0, Math.min(journey.length - 1, Math.round(slides.scrollLeft / slides.clientWidth)));
    setActiveIndex(nextIndex);
    if (!programmaticScroll.current) setIsPlaying(false);
  };

  const handleWheel = (event: ReactWheelEvent<HTMLDivElement>) => {
    const slides = slidesRef.current;
    if (!slides || Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;

    event.preventDefault();
    slides.scrollBy({ left: event.deltaY, behavior: "auto" });
  };

  const handleKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    let nextIndex = activeIndex;
    if (event.key === "ArrowRight") nextIndex = Math.min(journey.length - 1, activeIndex + 1);
    else if (event.key === "ArrowLeft") nextIndex = Math.max(0, activeIndex - 1);
    else if (event.key === "Home") nextIndex = 0;
    else if (event.key === "End") nextIndex = journey.length - 1;
    else return;

    event.preventDefault();
    setIsPlaying(false);
    goToStep(nextIndex);
  };

  return (
    <section
      className="ritual-sequence"
      id="ritual"
      aria-labelledby="ritual-title"
      data-ritual-sequence
      data-chapter="craft"
    >
      <div className="ritual-sequence-intro">
        <span className="section-number">03 / THE CRAFT</span>
        <p className="eyebrow">From bean to cup</p>
        <h2 id="ritual-title">The coffee<br />takes shape<br /><em>here.</em></h2>
        <p className="body-copy">
          Roast, grind, pour. Scroll sideways to follow each step, or pause to take it in.
        </p>
        <span className="ritual-scroll-cue"><i /> SCROLL SIDEWAYS TO EXPLORE</span>
      </div>

      <div
        className="ritual-stage is-story-panel"
        data-ritual-stage
        role="region"
        aria-roledescription="carousel"
        aria-label="From bean to cup"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onFocusCapture={() => {
          if (skipFocusPause.current) {
            skipFocusPause.current = false;
            return;
          }
          setIsPlaying(false);
        }}
      >
        <button
          className="ritual-rotation-control"
          type="button"
          aria-label={isPlaying ? "Pause automatic stage rotation" : "Play automatic stage rotation"}
          onPointerDown={() => { skipFocusPause.current = true; }}
          onClick={() => setIsPlaying((playing) => !playing)}
        >
          {isPlaying ? (
            <svg aria-hidden="true" viewBox="0 0 16 16"><path d="M5 3.5v9M11 3.5v9" /></svg>
          ) : (
            <svg aria-hidden="true" viewBox="0 0 16 16"><path d="m5.5 3.5 7 4.5-7 4.5z" /></svg>
          )}
          <span>{isPlaying ? "Pause" : "Play"}</span>
        </button>

        <div className="ritual-progress" role="group" aria-label="Choose a coffee process stage">
          <span className="ritual-progress-status" aria-live={isPlaying ? "off" : "polite"} aria-atomic="true">
            Step {activeIndex + 1} of {journey.length}: {activeStep.shortName.toLowerCase()}
          </span>
          <ol>
            {journey.map((step, index) => (
              <li className={index === activeIndex ? "is-active" : index < activeIndex ? "is-complete" : ""} key={step.number}>
                <button
                  className="ritual-progress-button"
                  type="button"
                  aria-label={`Show stage ${index + 1}: ${step.name.toLowerCase()}`}
                  aria-current={index === activeIndex ? "step" : undefined}
                  onClick={() => {
                    setIsPlaying(false);
                    goToStep(index);
                  }}
                >
                  <span className="ritual-progress-number">{step.number}</span>
                  <span className="ritual-progress-name">{step.shortName}</span>
                </button>
              </li>
            ))}
          </ol>
        </div>

        <div
          className="ritual-slides"
          ref={slidesRef}
          tabIndex={0}
          aria-label="Coffee process stages. Scroll horizontally to explore."
          aria-live={isPlaying ? "off" : "polite"}
          onScroll={handleScroll}
          onWheel={handleWheel}
          onKeyDown={handleKeyDown}
        >
          {journey.map((step, index) => (
            <article
              className="ritual-step"
              data-ritual-step
              key={step.number}
              role="group"
              aria-roledescription="slide"
              aria-label={`${index + 1} of ${journey.length}: ${step.name.toLowerCase()}`}
              aria-hidden={index !== activeIndex}
            >
              <span className="ritual-step-watermark" aria-hidden="true">{step.number}</span>
              <div className="ritual-step-copy">
                <span className="eyebrow">{step.number} / {step.name}</span>
                <h3>{step.title}</h3>
                <p>{step.copy}</p>
                <span className="ritual-step-index">{step.number}<i />{journey.length.toString().padStart(2, "0")}</span>
              </div>
              <div className="ritual-step-image">
                <Image
                  src={step.image}
                  alt={step.alt}
                  fill
                  sizes="(max-width: 760px) 100vw, 58vw"
                  className="editorial-image"
                  priority={index === 0}
                />
                <span className="ritual-photo-note">{step.note}</span>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
