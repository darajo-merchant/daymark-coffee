"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import Image from "next/image";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export type StoryChapter = {
  id: string;
  name: string;
  title: ReactNode;
  paragraphs: string[];
  image: string;
  alt: string;
};

/**
 * Our Story chapters. Desktop: the text scrolls while one photo frame stays in view
 * (CSS sticky, no pin), and the photo "develops" into the next chapter's image as each
 * chapter reaches the middle of the screen. Phones: each chapter carries its own photo.
 */
export function StoryChapters({ chapters }: { chapters: StoryChapter[] }) {
  const root = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const element = root.current;
    if (!element) return;
    gsap.registerPlugin(ScrollTrigger);
    const triggers = Array.from(element.querySelectorAll<HTMLElement>("[data-story-chapter]")).map((chapter, index) =>
      ScrollTrigger.create({
        trigger: chapter,
        start: "top 55%",
        end: "bottom 55%",
        onToggle: (self) => { if (self.isActive) setActive(index); },
      }),
    );
    return () => triggers.forEach((trigger) => trigger.kill());
  }, []);

  // Cross-fade the sticky photos: the new one develops in while settling from 4% larger.
  useEffect(() => {
    const element = root.current;
    if (!element) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    element.querySelectorAll<HTMLElement>("[data-story-photo]").forEach((photo, index) => {
      const on = index === active;
      gsap.to(photo, {
        opacity: on ? 1 : 0,
        scale: on ? 1 : 1.04,
        duration: reduced ? 0 : on ? 1.3 : 0.9,
        ease: on ? "power2.out" : "power1.inOut",
        overwrite: true,
      });
    });
  }, [active]);

  return (
    <div className="os-chapters" ref={root}>
      <div className="os-stage" aria-hidden="true">
        <div className="os-frame">
          {chapters.map((chapter, index) => (
            <div className="os-photo" data-story-photo key={chapter.id} style={{ opacity: index === 0 ? 1 : 0 }}>
              <Image src={chapter.image} alt="" fill sizes="(max-width: 899px) 1px, 46vw" />
            </div>
          ))}
          <div className="os-frame-meta">
            <span className="os-count"><b>{String(active + 1).padStart(2, "0")}</b> / {String(chapters.length).padStart(2, "0")}</span>
            <span className="os-frame-name">{chapters[active]?.name}</span>
          </div>
        </div>
        <ol className="os-dots">
          {chapters.map((chapter, index) => (
            <li key={chapter.id} className={index === active ? "is-active" : ""} />
          ))}
        </ol>
      </div>

      <div className="os-texts">
        {chapters.map((chapter, index) => (
          <article className="os-chapter" id={chapter.id} key={chapter.id} data-story-chapter aria-labelledby={`${chapter.id}-title`}>
            <figure className="os-inline-photo" data-frame>
              <div className="xp-parallax" data-parallax-inner>
                <Image src={chapter.image} alt={chapter.alt} fill sizes="(max-width: 899px) 100vw, 1px" />
              </div>
            </figure>
            <p className="xp-label os-chapter-label">
              <span>Chapter {String(index + 1).padStart(2, "0")}</span>
              <i aria-hidden="true" />
              {chapter.name}
            </p>
            <h2 id={`${chapter.id}-title`} data-split>{chapter.title}</h2>
            <div className="os-chapter-copy" data-reveal>
              {chapter.paragraphs.map((paragraph) => <p key={paragraph.slice(0, 24)}>{paragraph}</p>)}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
