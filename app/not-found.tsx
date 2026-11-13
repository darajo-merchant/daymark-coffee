import type { Metadata } from "next";
import { ArrowIcon } from "./components/arrow-icon";
import { BeanMark } from "./components/bean-mark";
import { SiteFooter } from "./components/site-footer";
import { SiteHeader } from "./components/site-header";

export const metadata: Metadata = {
  title: "Page not found | Daymark Coffee",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <div className="site-shell" id="top">
      <SiteHeader />
      <main id="main-content" tabIndex={-1} className="xp-lost">
        <BeanMark className="xp-lost-bean" />
        <p className="xp-label">Wrong turn</p>
        <h1>This page seems to have{" "}<br />wandered off for a <em>coffee.</em></h1>
        <p className="xp-lost-copy">The address you followed doesn&rsquo;t exist. The good stuff is still exactly where it should be.</p>
        <div className="xp-lost-actions">
          <a className="button button-dark" href="/">Back to the start <ArrowIcon direction="up-right" /></a>
          <a className="xp-link" href="/menu">See the menu <ArrowIcon direction="up-right" /></a>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
