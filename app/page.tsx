import Image from "next/image";
import { AppBadges } from "./components/app-badges";
import { ArrowIcon } from "./components/arrow-icon";
import { LineIcon } from "./components/line-icons";
import { BeanMark } from "./components/bean-mark";
import { HomeHero } from "./components/home-hero";
import { MenuShowcase } from "./components/menu-showcase";
import { ProcessStory } from "./components/process-story";
import { ScrollMotion } from "./components/scroll-motion";
import { SiteFooter } from "./components/site-footer";
import { SiteHeader } from "./components/site-header";
import { WordReveal } from "./components/word-reveal";
import { getSiteContent } from "../lib/site-content";

const imageBase = "https://images.unsplash.com/";

export const dynamic = "force-dynamic";

export default async function Home() {
  const { business, menu, apps } = await getSiteContent();
  const featured = menu.slice(0, 6);
  const hoursLabel = business.isConfirmed ? "Opening hours" : "Temporary hours";
  const addressLabel = business.isConfirmed ? "Address" : "Temporary address";

  return (
    <ScrollMotion>
      <div className="site-shell xp-home" id="top">
        <SiteHeader />

        <main id="main-content" tabIndex={-1}>
          <HomeHero />

          <section className="xp-statement" aria-label="Our approach" data-chapter="origin">
            <div className="xp-statement-inner">
              <span className="xp-label xp-label--muted">The idea</span>
              <WordReveal
                lines={[
                  "Every cup follows the same quiet path:",
                  "a good bean, a careful grind, a slow pour.",
                  "Then it is yours, warm, before the day begins.",
                ]}
                accent="yours, warm,"
              />
              <a className="xp-link" href="#ritual">Follow the process <ArrowIcon direction="down-right" /></a>
            </div>
          </section>

          <ProcessStory />

          <section className="xp-menu" aria-labelledby="menu-preview-title" id="menu-preview">
            <div className="xp-menu-head" data-reveal>
              <div>
                <span className="xp-label">On the counter</span>
                <h2 id="menu-preview-title" data-split>Find your <em>usual.</em></h2>
              </div>
              <p className="body-copy">Espresso classics, from a short, direct shot to a smooth milk coffee.</p>
            </div>

            <MenuShowcase items={featured} />

            <div className="xp-menu-foot" data-reveal>
              <a className="button button-dark" href="/menu">See the full menu <ArrowIcon direction="up-right" /></a>
              {menu.some((item) => !item.price) && <p>Prices will be added once confirmed by the café.</p>}
            </div>
          </section>

          <section className="xp-marquee" data-marquee aria-label="Good coffee, no rush" id="moment">
            <div className="xp-marquee-track" aria-hidden="true">
              {Array.from({ length: 2 }, (_, copy) => (
                <div className="xp-marquee-row" key={copy}>
                  <span>Good coffee</span><BeanMark className="xp-marquee-bean" />
                  <span><em>no rush</em></span><BeanMark className="xp-marquee-bean" />
                  <span>The day can wait</span><BeanMark className="xp-marquee-bean" />
                </div>
              ))}
            </div>
          </section>

          <section className="connection section-pad" id="coffee" aria-labelledby="connection-title" data-chapter="connection">
            <div className="connection-heading" data-reveal>
              <div>
                <span className="xp-label">The café</span>
              </div>
              <p className="connection-side-note">Come for a quick cup. Stay if you can.</p>
            </div>

            <div className="connection-layout">
              <div className="connection-gallery">
                <div className="connection-main-image" data-frame="0">
                  <div className="xp-parallax" data-parallax-inner>
                  <Image
                    src={`${imageBase}photo-1792325416561-76b46e59783c?auto=format&fit=crop&w=1600&q=82`}
                    alt="A quiet café interior with round wooden tables and woven chairs"
                    fill
                    sizes="(max-width: 760px) 100vw, 54vw"
                    className="editorial-image"
                  />
                  </div>
                  <span className="connection-image-caption">MAKE YOURSELF AT HOME</span>
                </div>
                <div className="connection-detail-image" data-frame="4">
                  <div className="xp-parallax" data-parallax-inner>
                  <Image
                    src={`${imageBase}photo-1789700736833-9ae7f8ee71cd?auto=format&fit=crop&w=900&q=82`}
                    alt="Coffee beans in a pool of warm light"
                    fill
                    sizes="(max-width: 760px) 60vw, 22vw"
                    className="editorial-image"
                  />
                  </div>
                </div>
              </div>

              <div className="connection-copy" data-reveal>
                <p className="eyebrow">However your day looks</p>
                <h2 id="connection-title" data-split>Your kind of{" "}<br /><em>coffee break.</em></h2>
                <p className="body-copy">
                  Stop in for an espresso, meet a friend, or take a table by yourself.
                </p>
                <dl className="xp-visit-cards" id="visit-details">
                  <div>
                    <dt>{addressLabel}</dt>
                    <dd>{business.address || "Address to be confirmed"}</dd>
                  </div>
                  <div>
                    <dt>{hoursLabel}</dt>
                    <dd className="visit-hours-value">{business.hours || "Hours to be confirmed"}</dd>
                  </div>
                </dl>
                <a className="button button-dark" href="/visit">Plan your visit <ArrowIcon direction="up-right" /></a>
              </div>
            </div>
          </section>

          <section className="xp-journal section-pad" aria-labelledby="journal-title" data-chapter="journal">
            <div className="xp-journal-head" data-reveal>
              <div>
                <span className="xp-label">The photo journal</span>
                <h2 id="journal-title" data-split>Little moments,{" "}<br />kept <em>warm.</em></h2>
              </div>
              <p className="connection-side-note">The coffee between the chapters.</p>
            </div>

            <div className="xp-journal-grid">
              {[
                { src: "/images/pages/about-hero.webp", alt: "A barista's hands holding a cup under an espresso machine", label: "Behind the counter", line: "Where your cup begins.", tall: true },
                { src: "/images/journey/02-roasting.webp", alt: "Freshly roasted beans tumbling from a warm roaster", label: "The roast", line: "Heat, time, patience." },
                { src: "/images/pages/drink-flat-white.webp", alt: "A flat white with rosetta latte art", label: "On top", line: "A little art in the milk.", tall: true },
                { src: "/images/journey/04-espresso.webp", alt: "Espresso streaming into a ceramic cup", label: "The first pour", line: "Worth the short wait." },
                { src: "/images/pages/visit-hero.webp", alt: "A coffee on a small table by a café window", label: "By the window", line: "A seat for your moment.", tall: true },
                { src: "/images/journey/01-whole-bean.webp", alt: "A single roasted coffee bean in low light", label: "The bean", line: "Small thing, big job." },
              ].map((tile) => (
                <figure className={`xp-journal-tile ${tile.tall ? "is-tall" : ""}`} key={tile.label} data-frame>
                  <div className="xp-parallax" data-parallax-inner>
                    <Image src={tile.src} alt={tile.alt} fill sizes="(max-width: 760px) 50vw, 31vw" />
                  </div>
                  <figcaption>
                    <span className="xp-label">{tile.label}</span>
                    <em>{tile.line}</em>
                  </figcaption>
                  <ArrowIcon direction="up-right" />
                </figure>
              ))}
            </div>
          </section>

          <section className="xp-stay section-pad" aria-labelledby="stay-title">
            <div className="xp-stay-card" data-reveal>
              <BeanMark className="xp-stay-mark" />
              <div className="xp-stay-copy">
                <p className="xp-label">Stay close</p>
                <h2 id="stay-title" data-split>Join the {" "}<br />Daymark <em>Circle.</em></h2>
                <p>A free account for regulars. Be first to hear what&rsquo;s new at the counter, and let us remember your usual.</p>
                <div className="xp-stay-actions">
                  <a className="button button-light" href="/account/join">Join the circle <ArrowIcon direction="up-right" /></a>
                  <a className="xp-link" href="/account/sign-in">Sign in <ArrowIcon direction="up-right" /></a>
                </div>
              </div>
              <div className="xp-stay-side">
                <ul className="xp-stay-perks">
                  <li><LineIcon name="cup" />Keep your usual on file</li>
                  <li><LineIcon name="mail" />Hear about new drinks first, if you want to</li>
                  <li><LineIcon name="heart" />Your details stay yours: edit or delete anytime</li>
                </ul>
                {(apps.appStore || apps.playStore) && (
                  <div className="xp-stay-app">
                    <p className="xp-label">Daymark, in your pocket</p>
                    <AppBadges apps={apps} />
                  </div>
                )}
              </div>
            </div>
          </section>

          <section className="invitation xp-invitation" data-rise id="visit" aria-labelledby="invitation-title" data-chapter="invitation">
            <div className="invitation-topline">
              <span className="section-number">When you&rsquo;re ready</span>
              <BeanMark className="invitation-bean" />
            </div>
            <div className="invitation-copy" data-reveal>
              <h2 id="invitation-title" data-split>Come by for{" "}<br />a good <em>cup.</em></h2>
              <p className="body-copy">Explore the coffee, then find the visit details and guest notes on our Visit page.</p>
              <div className="invitation-actions">
                <a className="button button-light" href="/menu">
                  See the menu <ArrowIcon direction="up-right" />
                </a>
                <a className="invitation-link" href="/visit">
                  Find us <ArrowIcon direction="up-right" />
                </a>
              </div>
            </div>
          </section>
        </main>

        <SiteFooter home />
      </div>
    </ScrollMotion>
  );
}
