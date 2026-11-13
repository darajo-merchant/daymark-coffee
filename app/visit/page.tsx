import type { Metadata } from "next";
import Image from "next/image";
import { ArrowIcon } from "../components/arrow-icon";
import { BeanMark } from "../components/bean-mark";
import { LineIcon } from "../components/line-icons";
import { PageHero } from "../components/page-hero";
import { ScrollMotion } from "../components/scroll-motion";
import { SiteFooter } from "../components/site-footer";
import { SiteHeader } from "../components/site-header";
import { getSiteContent } from "../../lib/site-content";

export const metadata: Metadata = {
  title: "Visit Daymark Coffee | Guest reviews and café details",
  description: "Find Daymark Coffee visit information and guest reviews.",
};

export const dynamic = "force-dynamic";

export default async function VisitPage() {
  const { business, testimonials = [] } = await getSiteContent();
  const publishedTestimonials = testimonials.filter((testimonial) => testimonial.isPublished && testimonial.quote.trim() && testimonial.author.trim());
  const addressLabel = business.isConfirmed ? "Address" : "Temporary address";
  const hoursLabel = business.isConfirmed ? "Opening hours" : "Temporary hours";
  const locationNote = [business.city, business.directions].filter(Boolean).join(" · ");

  return (
    <ScrollMotion>
      <div className="site-shell" id="top">
        <SiteHeader />

        <main id="main-content" tabIndex={-1} className="xp-inner">
          <PageHero
            id="visit-title"
            chapter="visit"
            kicker="When the day allows"
            title={<>Make room {" "}<br />for a <em>visit.</em></>}
            intro={<p>A table by the window, a warm cup, and no rush. Here&rsquo;s everything you need before you come by.</p>}
            actions={
              <>
                <a className="button button-dark" href="#visit-details">Visit details <ArrowIcon direction="down-right" /></a>
                <a className="xp-link" href="/menu">See the menu <ArrowIcon direction="up-right" /></a>
              </>
            }
            media={{ kind: "image", src: "/images/pages/visit-hero.webp", alt: "A cup of coffee on a small round table beside a café window", position: "50% 60%" }}
            card={
              <div className="xp-card-list">
                <p className="xp-label">{business.isConfirmed ? "Find us" : "Find us · temporary"}</p>
                <ul>
                  <li><LineIcon name="pin" /><span>Address</span><strong>{business.address || "To be confirmed"}</strong></li>
                  <li><LineIcon name="clock" /><span>Hours</span><strong className="visit-hours-value">{business.hours || "To be confirmed"}</strong></li>
                </ul>
              </div>
            }
          />

          <section className="xp-section" id="visit-details" aria-labelledby="visit-information-title">
            <div className="xp-section-head" data-reveal>
              <div>
                <p className="xp-label">Plan your visit</p>
                <h2 id="visit-information-title" data-split>Find your way {" "}<br />to a good <em>cup.</em></h2>
              </div>
              <p className="body-copy">{business.isConfirmed ? "Check the current address and opening schedule before you come by." : "We’re using this temporary address and schedule while the permanent details are confirmed."}</p>
            </div>

            <div className="xp-info-grid" data-reveal-group>
              <article className="xp-info-card" data-reveal-item>
                <span className="xp-channel-icon"><LineIcon name="pin" /></span>
                <p className="xp-label">{addressLabel}</p>
                <h3>{business.address || "Address to be confirmed"}</h3>
                <p>{locationNote || "City details and directions will be added once confirmed."}</p>
              </article>
              <article className="xp-info-card" data-reveal-item>
                <span className="xp-channel-icon"><LineIcon name="clock" /></span>
                <p className="xp-label">{hoursLabel}</p>
                <h3 className="visit-hours-value">{business.hours || "Hours to be confirmed"}</h3>
                <p>{business.isConfirmed ? "Any holiday changes will be posted here." : "These hours may change while the details are confirmed."}</p>
              </article>
              <article className="xp-info-card" data-reveal-item>
                <span className="xp-channel-icon"><LineIcon name="cup" /></span>
                <p className="xp-label">Ordering &amp; seating</p>
                <h3>Ask us at the counter.</h3>
                <p>Online ordering and reservations aren&rsquo;t set up yet. Visit during opening hours to ask about today&rsquo;s menu and seating.</p>
              </article>
            </div>

            <div className="xp-photo-strip" data-reveal-group aria-hidden="true">
              {["drink-flat-white", "drink-espresso", "drink-latte"].map((name) => (
                <div className="xp-photo-strip-item" key={name} data-reveal-item>
                  <Image src={`/images/pages/${name}.webp`} alt="" fill sizes="(max-width: 899px) 50vw, 30vw" />
                </div>
              ))}
            </div>
          </section>

          <section className="xp-section xp-steps-section" aria-labelledby="first-visit-title">
            <div className="xp-section-head" data-reveal>
              <div>
                <p className="xp-label">How a visit works</p>
                <h2 id="first-visit-title" data-split>Three steps to {" "}<br />a good <em>pause.</em></h2>
              </div>
              <p className="body-copy">No booking needed — just walk in during opening hours.</p>
            </div>

            <ol className="xp-steps" data-reveal-group>
              <li className="xp-step" data-reveal-item>
                <span className="xp-step-number" aria-hidden="true">01</span>
                <h3>Find the door</h3>
                <p>{business.address ? `We're at ${business.address}.` : "The address will be posted here soon."}{business.isConfirmed ? "" : " It's our temporary home while the permanent details are confirmed."}</p>
              </li>
              <li className="xp-step" data-reveal-item>
                <span className="xp-step-number" aria-hidden="true">02</span>
                <h3>Order at the counter</h3>
                <p>Ask what&rsquo;s on today. The menu is short, so deciding is the easy part.</p>
              </li>
              <li className="xp-step" data-reveal-item>
                <span className="xp-step-number" aria-hidden="true">03</span>
                <h3>Make it your moment</h3>
                <p>Find a seat, take a breath. The day can wait for one cup.</p>
              </li>
            </ol>
          </section>

          <section className="xp-section xp-section--dark" aria-labelledby="guest-reviews-title" data-chapter="guest-notes">
            <BeanMark className="xp-dark-watermark" />
            <div className="xp-section-head" data-reveal>
              <div>
                <p className="xp-label">Guest notes</p>
                <h2 id="guest-reviews-title" data-split>Good words {" "}<br />take <em>time.</em></h2>
              </div>
              <p className="body-copy">{publishedTestimonials.length ? "A few words from the people who have shared a cup with us." : "We’ll share genuine guest reviews here when we have permission to publish them."}</p>
            </div>

            {publishedTestimonials.length ? (
              <div className="xp-quote-grid" data-reveal-group>
                {publishedTestimonials.map((testimonial) => (
                  <figure className="xp-quote" data-reveal-item key={testimonial.id}>
                    <span className="xp-quote-mark" aria-hidden="true">&ldquo;</span>
                    <blockquote>{testimonial.quote}</blockquote>
                    <figcaption>{testimonial.author}</figcaption>
                  </figure>
                ))}
              </div>
            ) : (
              <div className="xp-empty-note" data-reveal>
                <span className="xp-empty-glow" aria-hidden="true"><BeanMark className="xp-empty-mark" /></span>
                <div>
                  <p className="xp-label">Reviews will appear here</p>
                  <p>No guest reviews have been published yet. This space stays open for the real thing.</p>
                </div>
              </div>
            )}

            <a className="xp-link xp-section-link" href="/contact" data-reveal>
              Questions before your visit? Get in touch <ArrowIcon direction="up-right" />
            </a>
          </section>
        </main>

        <SiteFooter />
      </div>
    </ScrollMotion>
  );
}
