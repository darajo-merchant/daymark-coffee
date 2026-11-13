import type { Metadata } from "next";
import { ScrollMotion } from "../components/scroll-motion";
import { SiteFooter } from "../components/site-footer";
import { SiteHeader } from "../components/site-header";
import { getSiteContent } from "../../lib/site-content";

export const metadata: Metadata = {
  title: "Privacy notice | Daymark Coffee",
  description: "How Daymark Coffee handles the details you share with us.",
};

export const dynamic = "force-dynamic";

// Plain-language notice describing what this site actually does. The café owner
// should review it (and local data-protection rules) before launch; it is not legal advice.
export default async function PrivacyPage() {
  const { contact } = await getSiteContent();
  const contactLine = contact.email
    ? <>email us at <a href={`mailto:${contact.email}`}>{contact.email}</a></>
    : <>ask us in person at the café</>;

  return (
    <ScrollMotion>
      <div className="site-shell" id="top">
        <SiteHeader />
        <main id="main-content" tabIndex={-1} className="xp-legal">
          <p className="xp-label" data-hero-reveal>Privacy notice</p>
          <h1 data-hero-reveal>Your details, {" "}<br />handled with <em>care.</em></h1>
          <p className="xp-legal-lead" data-hero-reveal>We keep this simple: we only ask for what we need, we never sell it, and you can change or delete it whenever you like.</p>

          <section>
            <h2>What we collect</h2>
            <p>When you join the Daymark Circle we store your <strong>name</strong> and <strong>email address</strong>, plus anything optional you choose to add: a <strong>phone number</strong>, your <strong>birthday</strong> (month and day only, never the year), and your <strong>usual drink</strong>. We also record whether you&rsquo;d like to receive news from us, and when you accepted this notice.</p>
            <p>Your password is passed securely to our account provider, which stores it only in scrambled (hashed) form. Neither we nor anyone else can read it back.</p>
          </section>

          <section>
            <h2>Why we use it</h2>
            <ul>
              <li>To run your account and let you sign in.</li>
              <li>To remember your usual drink.</li>
              <li>To send you café news by email, <strong>only if you ticked that box</strong>. You can switch it off anytime from your account.</li>
            </ul>
          </section>

          <section>
            <h2>Where it&rsquo;s kept</h2>
            <p>Account details are stored with Supabase, a secure database and sign-in provider, and are visible only to the café owner through a password-protected dashboard. We don&rsquo;t sell or share your details with advertisers.</p>
          </section>

          <section>
            <h2>Cookies and visit statistics</h2>
            <p>We set one cookie when you sign in, so you stay signed in. It contains no advertising or tracking information. To understand which pages are popular, we count daily page visits in total. These counts store no IP address, cookie or anything else that identifies you.</p>
          </section>

          <section>
            <h2>Your choices</h2>
            <p>You can view and edit your details, switch news emails on or off, or <strong>permanently delete your account</strong> at any time from your <a href="/account">account page</a>. Deleting your account removes your details from our system.</p>
          </section>

          <section>
            <h2>Questions</h2>
            <p>If you have a question about your details, {contactLine}.</p>
            <p className="xp-legal-date">Last updated: November 2026</p>
          </section>
        </main>
        <SiteFooter />
      </div>
    </ScrollMotion>
  );
}
