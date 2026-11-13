import type { Metadata } from "next";
import Image from "next/image";
import { ArrowIcon } from "../components/arrow-icon";
import { LineIcon } from "../components/line-icons";
import { PageHero } from "../components/page-hero";
import { ScrollMotion } from "../components/scroll-motion";
import { SiteFooter } from "../components/site-footer";
import { SiteHeader } from "../components/site-header";
import { getSiteContent } from "../../lib/site-content";

export const metadata: Metadata = {
  title: "Coffee Menu | Daymark Coffee",
  description: "Explore the Daymark Coffee menu, from espresso to smooth milk coffees.",
};

export const dynamic = "force-dynamic";

// Photos for the starter drinks; anything the owner adds later falls back to the bean close-up.
const drinkPhotos: Record<string, { src: string; alt: string }> = {
  espresso: { src: "/images/pages/drink-espresso.webp", alt: "An espresso in a white cup on a wooden table" },
  americano: { src: "/images/pages/drink-americano.webp", alt: "A black coffee in a white cup beside a water carafe" },
  cappuccino: { src: "/images/pages/drink-cappuccino.webp", alt: "A cappuccino with leaf latte art" },
  "flat-white": { src: "/images/pages/drink-flat-white.webp", alt: "A flat white with rosetta latte art" },
  latte: { src: "/images/pages/drink-latte.webp", alt: "Two lattes with latte art in glass cups" },
  mocha: { src: "/images/pages/drink-mocha.webp", alt: "A mocha dusted with cocoa in a white cup" },
};
const fallbackPhoto = { src: "/media/bean-poster.webp", alt: "Close-up of roasted coffee beans" };

export default async function MenuPage() {
  const { menu } = await getSiteContent();
  const pricesPending = menu.some((item) => !item.price);
  const preview = menu.slice(0, 3);

  return (
    <ScrollMotion>
      <div className="site-shell" id="top">
        <SiteHeader />

        <main id="main-content" tabIndex={-1} className="xp-inner">
          <PageHero
            id="menu-title"
            chapter="menu"
            kicker="Made for the moment"
            title={<>A good cup {" "}<br />starts <em>here.</em></>}
            intro={<p>From a short, direct espresso to a smooth milk coffee: browse the classics and find your usual.</p>}
            actions={
              <>
                <a className="button button-dark" href="#coffee-list">Browse the menu <ArrowIcon direction="down-right" /></a>
                <a className="xp-link" href="/visit">Plan a visit <ArrowIcon direction="up-right" /></a>
              </>
            }
            media={{ kind: "video", src: "/media/latte.mp4", poster: "/media/latte-poster.webp", label: "Latte art taking shape as milk is poured into espresso" }}
            card={
              <div className="xp-card-list">
                <p className="xp-label">On the counter</p>
                <ul>
                  {preview.map((item) => (
                    <li key={item.id}><LineIcon name="cup" /><span>{item.name}</span><strong>{item.price || "Price soon"}</strong></li>
                  ))}
                </ul>
                {menu.length > preview.length && <a className="xp-card-more" href="#coffee-list">+{menu.length - preview.length} more drinks <ArrowIcon direction="down-right" /></a>}
              </div>
            }
          />

          <section className="xp-section" id="coffee-list" aria-labelledby="coffee-list-title">
            <div className="xp-section-head" data-reveal>
              <div>
                <p className="xp-label">The coffee list</p>
                <h2 id="coffee-list-title" data-split>Find your {" "}<br />kind of <em>cup.</em></h2>
              </div>
              <p className="body-copy">Short, smooth, or somewhere in between: a short list of espresso classics.</p>
            </div>

            <ol className="xp-drink-grid" data-reveal-group>
              {menu.map((item, index) => {
                const photo = drinkPhotos[item.id] ?? fallbackPhoto;
                return (
                  <li className="xp-drink" key={item.id} data-reveal-item>
                    <div className="xp-drink-media">
                      <Image src={photo.src} alt={photo.alt} fill sizes="(max-width: 640px) 100vw, (max-width: 1100px) 50vw, 33vw" />
                      <span className="xp-drink-number">{String(index + 1).padStart(2, "0")}</span>
                    </div>
                    <div className="xp-drink-copy">
                      <div className="xp-drink-title">
                        <h3>{item.name}</h3>
                        <span className={`xp-price ${item.price ? "" : "is-pending"}`}>{item.price || "Price soon"}</span>
                      </div>
                      <p>{item.note}</p>
                    </div>
                  </li>
                );
              })}
            </ol>

            <p className="xp-footnote" data-reveal>
              <LineIcon name="drop" />
              {pricesPending ? "This is a temporary menu. Prices and today’s availability will be added once confirmed." : "Menu prices are maintained by the café and may change with availability."}
            </p>
          </section>

          <section className="invitation xp-invitation" aria-labelledby="menu-invitation-title" data-chapter="visit">
            <div className="invitation-topline">
              <span className="section-number">Your next cup</span>
            </div>
            <div className="invitation-copy" data-reveal>
              <h2 id="menu-invitation-title" data-split>Plan your {" "}<br /><em>visit.</em></h2>
              <p className="body-copy">Check the address and opening hours before you come by.</p>
              <div className="invitation-actions">
                <a className="button button-light" href="/visit">Plan a visit <ArrowIcon direction="up-right" /></a>
                <a className="invitation-link" href="/contact">Get in touch <ArrowIcon direction="up-right" /></a>
              </div>
            </div>
          </section>
        </main>

        <SiteFooter />
      </div>
    </ScrollMotion>
  );
}
