import type { ReactNode } from "react";
import Image from "next/image";
import { BeanMark } from "./bean-mark";
import { SiteFooter } from "./site-footer";
import { SiteHeader } from "./site-header";

/** Split layout for the member pages: the form on paper, a warm coffee photo alongside. */
export function AuthShell({ kicker, title, intro, children, image, imageAlt, quote }: {
  kicker: string;
  title: ReactNode;
  intro: ReactNode;
  children: ReactNode;
  image: string;
  imageAlt: string;
  quote: ReactNode;
}) {
  return (
    <div className="site-shell" id="top">
      <SiteHeader />
      <main id="main-content" tabIndex={-1} className="xp-auth">
        <section className="xp-auth-panel">
          <p className="xp-label">{kicker}</p>
          <h1>{title}</h1>
          <div className="xp-auth-intro">{intro}</div>
          {children}
        </section>
        <aside className="xp-auth-visual" aria-hidden="true">
          <Image src={image} alt={imageAlt} fill sizes="(max-width: 899px) 0px, 45vw" preload />
          <div className="xp-auth-quote">
            <BeanMark className="xp-auth-bean" />
            <p>{quote}</p>
          </div>
        </aside>
      </main>
      <SiteFooter />
    </div>
  );
}
