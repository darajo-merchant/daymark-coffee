import { AppBadges } from "./app-badges";
import { ArrowIcon } from "./arrow-icon";
import { BeanMark } from "./bean-mark";
import { LineIcon } from "./line-icons";
import { SocialLinks } from "./social-links";
import { getSiteContent } from "../../lib/site-content";

const exploreLinks = [
  { label: "Home", href: "/" },
  { label: "Menu", href: "/menu" },
  { label: "How it’s made", href: "/#ritual" },
  { label: "Visit", href: "/visit" },
  { label: "Our story", href: "/our-story" },
  { label: "Contact", href: "/contact" },
];

export async function SiteFooter({ home = false }: { home?: boolean }) {
  const { business, contact, apps } = await getSiteContent();
  const topHref = home ? "#top" : "/#top";
  const hasSocial = Object.values(contact.socials).some(Boolean);
  const phoneHref = contact.phone ? `tel:${contact.phone.replace(/[^+\d]/g, "")}` : "";

  return (
    <footer className="xp-footer">
      <div className="xp-footer-grid">
        <div className="xp-footer-brand">
          <a className="xp-footer-wordmark" href={topHref} aria-label="Daymark Coffee home">
            <BeanMark className="xp-footer-bean" />
            <span>DAYMARK<small>COFFEE FOR THE DAY AHEAD</small></span>
          </a>
          <p className="xp-footer-line">Good coffee, no rush.{" "}<br /><em>See you for the next cup.</em></p>
          <div className="xp-footer-apps"><AppBadges apps={apps} /></div>
          <a className="xp-footer-more" href="/account/join">Join the Daymark Circle <ArrowIcon direction="up-right" /></a>
        </div>

        <nav className="xp-footer-col" aria-label="Footer navigation">
          <p className="xp-label">Explore</p>
          <ul>
            {exploreLinks.map((link) => (
              <li key={link.label}><a href={link.href}>{link.label}</a></li>
            ))}
          </ul>
        </nav>

        <div className="xp-footer-col">
          <p className="xp-label">{business.isConfirmed ? "Find us" : "Find us · temporary"}</p>
          <ul>
            <li className="xp-footer-fact"><LineIcon name="pin" /><span>{business.address || "Address to be confirmed"}</span></li>
            <li className="xp-footer-fact"><LineIcon name="clock" /><span className="visit-hours-value">{business.hours || "Hours to be confirmed"}</span></li>
          </ul>
          <a className="xp-footer-more" href="/visit">Visit details <ArrowIcon direction="up-right" /></a>
        </div>

        <div className="xp-footer-col">
          <p className="xp-label">Say hello</p>
          {contact.phone || contact.email || hasSocial ? (
            <>
              <ul>
                {contact.phone && <li className="xp-footer-fact"><LineIcon name="phone" /><a href={phoneHref}>{contact.phone}</a></li>}
                {contact.email && <li className="xp-footer-fact"><LineIcon name="mail" /><a href={`mailto:${contact.email}`}>{contact.email}</a></li>}
              </ul>
              {hasSocial && <SocialLinks urls={contact.socials} />}
            </>
          ) : (
            <p className="xp-footer-note">Direct channels are being set up. For now, the kettle is the best place to find us — come say hello in person.</p>
          )}
          <a className="xp-footer-more" href="/contact">All contact options <ArrowIcon direction="up-right" /></a>
        </div>
      </div>

      <div className="xp-footer-bottom">
        <small>© {new Date().getFullYear()} Daymark Coffee · <a href="/privacy">Privacy</a></small>
        <a className="xp-footer-top" href={topHref}>Back to the top <ArrowIcon direction="up" /></a>
      </div>

      <span className="xp-footer-ghost" aria-hidden="true">DAYMARK</span>
    </footer>
  );
}
