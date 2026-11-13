import type { Metadata } from "next";
import Image from "next/image";
import { ArrowIcon } from "../components/arrow-icon";
import { BeanMark } from "../components/bean-mark";
import { LineIcon } from "../components/line-icons";
import { PageHero } from "../components/page-hero";
import { ScrollMotion } from "../components/scroll-motion";
import { SocialLinks } from "../components/social-links";
import { SiteFooter } from "../components/site-footer";
import { SiteHeader } from "../components/site-header";
import { getSiteContent } from "../../lib/site-content";

export const metadata: Metadata = {
  title: "Contact Daymark Coffee | Say hello",
  description: "Get in touch with Daymark Coffee about the coffee, the café, or a future visit.",
};

export const dynamic = "force-dynamic";

export default async function ContactPage() {
  const { business, contact } = await getSiteContent();
  const phoneHref = contact.phone ? `tel:${contact.phone.replace(/[^+\d]/g, "")}` : "";
  const whatsappHref = contact.whatsapp ? `https://wa.me/${contact.whatsapp.replace(/\D/g, "")}` : "";
  const hasSocial = Object.values(contact.socials).some(Boolean);
  const hoursLabel = business.isConfirmed ? "Opening hours" : "Temporary hours";
  const addressLabel = business.isConfirmed ? "Address" : "Temporary address";

  const channels = [
    { icon: "phone" as const, title: "Call the café", value: contact.phone, href: phoneHref, note: "For quick questions during opening hours." },
    { icon: "chat" as const, title: "WhatsApp", value: contact.whatsapp ? "Message us" : "", href: whatsappHref, note: "Send a note and we’ll reply when we can.", external: true },
    { icon: "mail" as const, title: "Email", value: contact.email, href: contact.email ? `mailto:${contact.email}` : "", note: "Best for longer questions or anything that needs a detailed reply." },
  ];

  return (
    <ScrollMotion>
      <div className="site-shell" id="top">
        <SiteHeader />

        <main id="main-content" tabIndex={-1} className="xp-inner">
          <PageHero
            id="contact-title"
            chapter="hello"
            kicker="Questions, thoughts, coffee"
            title={<>Let&rsquo;s talk {" "}<br />about <em>coffee.</em></>}
            intro={<p>A question about the menu, a visit, or something you&rsquo;d like us to brew? Pick whatever channel suits you.</p>}
            actions={
              <>
                <a className="button button-dark" href="#reach-us">Ways to reach us <ArrowIcon direction="down-right" /></a>
                <a className="xp-link" href="/visit">Plan a visit <ArrowIcon direction="up-right" /></a>
              </>
            }
            media={{ kind: "image", src: "/images/pages/contact-hero.webp", alt: "A hand resting by a latte and a phone on a warm wooden table", position: "50% 55%" }}
            card={
              <div className="xp-card-list">
                <p className="xp-label">Reach Daymark</p>
                <ul>
                  <li><LineIcon name="phone" /><span>Phone</span><strong>{contact.phone ? <a href={phoneHref}>{contact.phone}</a> : "Coming soon"}</strong></li>
                  <li><LineIcon name="chat" /><span>WhatsApp</span><strong>{whatsappHref ? <a href={whatsappHref} target="_blank" rel="noreferrer">Message us</a> : "Coming soon"}</strong></li>
                  <li><LineIcon name="mail" /><span>Email</span><strong>{contact.email ? <a href={`mailto:${contact.email}`}>{contact.email}</a> : "Coming soon"}</strong></li>
                  <li><LineIcon name="heart" /><span>Social</span><strong>{hasSocial ? "Follow along" : "Coming soon"}</strong></li>
                </ul>
              </div>
            }
          />

          <section className="xp-section" id="reach-us" aria-labelledby="reach-title">
            <div className="xp-section-head" data-reveal>
              <div>
                <p className="xp-label">Ways to reach us</p>
                <h2 id="reach-title" data-split>Pick a channel, {" "}<br />we&rsquo;ll bring the <em>coffee.</em></h2>
              </div>
              <p className="body-copy">Direct channels are being set up. Anything marked &ldquo;coming soon&rdquo; will switch on as soon as the café confirms it.</p>
            </div>

            <div className="xp-channel-grid" data-reveal-group>
              {channels.map((channel) => {
                const live = Boolean(channel.href);
                const content = (
                  <>
                    <span className="xp-channel-icon"><LineIcon name={channel.icon} /></span>
                    <h3>{channel.title}</h3>
                    <p>{channel.note}</p>
                    <span className={`xp-channel-status ${live ? "is-live" : ""}`}>
                      {live ? <>{channel.value} <ArrowIcon direction="up-right" /></> : "Coming soon"}
                    </span>
                    <BeanMark className="xp-channel-mark" />
                  </>
                );
                return live ? (
                  <a className="xp-channel" href={channel.href} key={channel.title} data-reveal-item {...(channel.external ? { target: "_blank", rel: "noreferrer" } : {})}>{content}</a>
                ) : (
                  <div className="xp-channel is-pending" key={channel.title} data-reveal-item>{content}</div>
                );
              })}
              <div className={`xp-channel ${hasSocial ? "" : "is-pending"}`} data-reveal-item>
                <span className="xp-channel-icon"><LineIcon name="heart" /></span>
                <h3>Follow along</h3>
                <p>New drinks, opening news and the occasional pour.</p>
                {hasSocial ? <SocialLinks urls={contact.socials} /> : <span className="xp-channel-status">Coming soon</span>}
                <BeanMark className="xp-channel-mark" />
              </div>
            </div>

            <div className="xp-feature-card" data-reveal>
              <div className="xp-feature-media">
                <Image src="/images/pages/drink-cappuccino.webp" alt="A cappuccino with leaf latte art on a wooden table" fill sizes="(max-width: 899px) 100vw, 40vw" />
              </div>
              <div className="xp-feature-copy">
                <p className="xp-label">Rather talk over a cup?</p>
                <h3>Come say hello {" "}<br />in <em>person.</em></h3>
                <dl className="xp-fact-list">
                  <div><dt><LineIcon name="pin" />{addressLabel}</dt><dd>{business.address || "Address to be confirmed"}</dd></div>
                  <div><dt><LineIcon name="clock" />{hoursLabel}</dt><dd className="visit-hours-value">{business.hours || "Hours to be confirmed"}</dd></div>
                </dl>
                <a className="button button-dark" href="/visit">Plan your visit <ArrowIcon direction="up-right" /></a>
              </div>
            </div>
          </section>

          <section className="xp-next" aria-label="Explore Daymark">
            <div className="xp-next-grid" data-reveal-group>
              <a className="xp-next-card" href="/#ritual" data-reveal-item>
                <span className="xp-next-icon"><LineIcon name="bean" /></span>
                <span><strong>Follow the coffee</strong>From whole bean to first pour.</span>
                <ArrowIcon direction="up-right" />
              </a>
              <a className="xp-next-card" href="/menu" data-reveal-item>
                <span className="xp-next-icon"><LineIcon name="cup" /></span>
                <span><strong>See the menu</strong>Espresso classics.</span>
                <ArrowIcon direction="up-right" />
              </a>
              <a className="xp-next-card" href="/our-story" data-reveal-item>
                <span className="xp-next-icon"><LineIcon name="drop" /></span>
                <span><strong>Read our story</strong>The name, the welcome, the cup.</span>
                <ArrowIcon direction="up-right" />
              </a>
            </div>
          </section>
        </main>

        <SiteFooter />
      </div>
    </ScrollMotion>
  );
}
