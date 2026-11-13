import type { ReactNode } from "react";
import Image from "next/image";
import { BeanMark } from "./bean-mark";

type Media =
  | { kind: "image"; src: string; alt: string; position?: string }
  | { kind: "video"; src: string; poster: string; label: string };

type PageHeroProps = {
  id: string;
  kicker: string;
  title: ReactNode;
  intro: ReactNode;
  actions?: ReactNode;
  media: Media;
  /** Page-specific details shown in a floating card over the photo. */
  card: ReactNode;
  caption?: string;
  chapter: string;
};

/**
 * Inner-page hero: editorial headline on the left, a tall rounded photo or clip on the
 * right, and a glass card carrying the page's own details (contact channels, hours...).
 * Entrance and parallax are driven by ScrollMotion through the data attributes.
 */
export function PageHero({ id, kicker, title, intro, actions, media, card, caption, chapter }: PageHeroProps) {
  return (
    <section className="xp-page-hero" aria-labelledby={id} data-chapter={chapter}>
      <div className="xp-page-hero-copy">
        <p className="xp-label" data-hero-reveal>{kicker}</p>
        <h1 id={id} data-hero-reveal>{title}</h1>
        <div className="xp-page-hero-intro" data-hero-reveal>{intro}</div>
        {actions && <div className="xp-page-hero-actions" data-hero-reveal>{actions}</div>}
      </div>

      <div className="xp-page-hero-visual">
        <figure className="xp-page-hero-media" data-hero-image>
          {media.kind === "image" ? (
            <Image
              src={media.src}
              alt={media.alt}
              fill
              preload
              sizes="(max-width: 899px) 100vw, 52vw"
              className="xp-page-hero-img"
              style={media.position ? { objectPosition: media.position } : undefined}
              data-parallax
            />
          ) : (
            <video
              className="xp-page-hero-img"
              src={media.src}
              poster={media.poster}
              autoPlay
              muted
              loop
              playsInline
              preload="auto"
              aria-label={media.label}
              data-parallax
              data-autoplay-video
            />
          )}
          {caption && <figcaption>{caption}</figcaption>}
        </figure>
        <div className="xp-float-card" data-float-card>{card}</div>
        <span className="xp-page-hero-stamp" aria-hidden="true">
          <BeanMark />
        </span>
      </div>
    </section>
  );
}
