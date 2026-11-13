"use client";

import { useEffect, useState, type FormEvent } from "react";
import type { SiteContent } from "../../lib/site-content";

type Session = { configured: boolean; authenticated: boolean };
type DailyView = { date: string; views: number };
type OverviewMetrics = {
  pageViews30d: number | null;
  dailyViews: DailyView[];
  viewTrackingReady: boolean;
  trackingNeedsSetup: boolean;
};

const blankOverview: OverviewMetrics = {
  pageViews30d: null,
  dailyViews: [],
  viewTrackingReady: false,
  trackingNeedsSetup: true,
};

const adminNavItems = [
  { id: "overview", label: "Overview", icon: "overview" },
  { id: "menu", label: "Coffee menu", icon: "menu" },
  { id: "reviews", label: "Guest reviews", icon: "reviews" },
  { id: "visit-details", label: "Visit details", icon: "visit" },
  { id: "contact-social", label: "Contact & social", icon: "contact" },
  { id: "members", label: "Circle members", icon: "members" },
  { id: "account-security", label: "Account security", icon: "security" },
] as const;

type Member = {
  email: string;
  fullName: string;
  phone: string;
  birthday: string;
  favouriteDrink: string;
  marketingOptIn: boolean;
  joinedAt: string;
  emailConfirmed: boolean;
};

type AdminIconName = (typeof adminNavItems)[number]["icon"];

function AdminIcon({ name }: { name: AdminIconName }) {
  const paths = {
    overview: <><rect x="3.5" y="3.5" width="7" height="7" rx="1" /><rect x="13.5" y="3.5" width="7" height="4" rx="1" /><rect x="13.5" y="10.5" width="7" height="10" rx="1" /><rect x="3.5" y="13.5" width="7" height="7" rx="1" /></>,
    menu: <><path d="M4 10h13v7a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3v-7Z" /><path d="M17 12h1.5a2.5 2.5 0 0 1 0 5H17M7 6c0-1 1-1.5 1-2.5M11 6c0-1 1-1.5 1-2.5M15 6c0-1 1-1.5 1-2.5" /></>,
    reviews: <><path d="M20 14.5a3.5 3.5 0 0 1-3.5 3.5H9l-5 3v-6.5A3.5 3.5 0 0 1 7.5 11h9a3.5 3.5 0 0 1 3.5 3.5Z" /><path d="M8 7h9a3 3 0 0 1 3 3M4 10V6a3 3 0 0 1 3-3h9" /></>,
    visit: <><path d="M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 1 1 14 0Z" /><circle cx="12" cy="10" r="2.2" /></>,
    contact: <><path d="M20 11.5a7.5 7.5 0 0 1-7.5 7.5 8 8 0 0 1-3.3-.7L4 20l1.7-4.2A7.4 7.4 0 0 1 5 12a7.5 7.5 0 1 1 15-.5Z" /><path d="M9 12h.01M12.5 12h.01M16 12h.01" /></>,
    security: <><rect x="4" y="10" width="16" height="11" rx="2" /><path d="M8 10V7a4 4 0 1 1 8 0v3M12 14v3" /></>,
    members: <><circle cx="9" cy="8" r="3.5" /><path d="M3 20a6 6 0 0 1 12 0M16 4.5a3.5 3.5 0 0 1 0 7M18 14.5a6 6 0 0 1 3 5.5" /></>,
  };

  return <svg className="admin-nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.65" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
}

function PageViewsChart({ data, available }: { data: DailyView[]; available: boolean }) {
  const width = 720;
  const height = 230;
  const left = 42;
  const right = 12;
  const top = 12;
  const bottom = 32;
  const chartWidth = width - left - right;
  const chartHeight = height - top - bottom;
  const values = data.map((item) => item.views);
  const maximum = Math.max(4, ...values);
  const hasViews = values.some((value) => value > 0);
  const points = data.map((item, index) => {
    const x = left + (data.length <= 1 ? 0 : (index / (data.length - 1)) * chartWidth);
    const y = top + chartHeight - (item.views / maximum) * chartHeight;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });
  const firstPoint = points[0]?.split(",")[0] ?? String(left);
  const lastPoint = points[points.length - 1]?.split(",")[0] ?? String(width - right);
  const areaPath = points.length
    ? `M ${firstPoint} ${top + chartHeight} L ${points.join(" L ")} L ${lastPoint} ${top + chartHeight} Z`
    : "";

  return (
    <div className="admin-chart-wrap">
      <svg className="admin-page-views-chart" viewBox={`0 0 ${width} ${height}`} role="img" aria-label={available ? `Daily page views over the last 30 days. ${hasViews ? "Views have been recorded." : "No views have been recorded yet."}` : "Page view chart. Analytics setup is required."}>
        {[0, 1, 2, 3, 4].map((step) => {
          const y = top + (chartHeight / 4) * step;
          const label = Math.round(maximum - (maximum / 4) * step);
          return <g key={step}><line x1={left} x2={width - right} y1={y} y2={y} /><text x={left - 10} y={y + 4} textAnchor="end">{label}</text></g>;
        })}
        {available && points.length > 1 && <><path className="admin-chart-area" d={areaPath} /><polyline className="admin-chart-line" points={points.join(" ")} /></>}
        {data.length > 1 && <g className="admin-chart-dates"><text x={left} y={height - 5}>{data[0].date.slice(5)}</text><text x={left + chartWidth / 2} y={height - 5} textAnchor="middle">{data[Math.floor(data.length / 2)].date.slice(5)}</text><text x={width - right} y={height - 5} textAnchor="end">{data[data.length - 1].date.slice(5)}</text></g>}
      </svg>
      {!available && <p className="admin-chart-message">Page views start counting after analytics is set up in Supabase.</p>}
      {available && !hasViews && <p className="admin-chart-message">No page views recorded in this period.</p>}
    </div>
  );
}

const blankContent: SiteContent = {
  business: { address: "", city: "", directions: "", hours: "", isConfirmed: false },
  contact: { phone: "", whatsapp: "", email: "", socials: { facebook: "", instagram: "", tiktok: "", youtube: "" } },
  menu: [],
  testimonials: [],
  apps: { appStore: "", playStore: "" },
};

export function AdminDashboard() {
  const [session, setSession] = useState<Session | null>(null);
  const [content, setContent] = useState<SiteContent>(blankContent);
  const [storage, setStorage] = useState<"local" | "supabase">("local");
  const [overview, setOverview] = useState<OverviewMetrics>(blankOverview);
  const [password, setPassword] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [activeSection, setActiveSection] = useState("overview");
  const [members, setMembers] = useState<Member[] | null>(null);
  const [membersError, setMembersError] = useState("");

  async function loadMembers() {
    setMembersError("");
    try {
      const response = await fetch("/api/admin/members", { cache: "no-store" });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "Could not load members.");
      setMembers(result.members ?? []);
    } catch (error) {
      setMembersError(error instanceof Error ? error.message : "Could not load members.");
    }
  }

  async function loadContent() {
    const response = await fetch("/api/admin/content", { cache: "no-store" });
    if (!response.ok) throw new Error("Could not load the saved site information.");
    const result = await response.json();
    setContent(result.content);
    setStorage(result.storage);
    setOverview(result.overview ?? blankOverview);
  }

  useEffect(() => {
    let mounted = true;
    fetch("/api/admin/session", { cache: "no-store" })
      .then((response) => response.json())
      .then(async (state: Session) => {
        if (!mounted) return;
        setSession(state);
        if (state.authenticated) await loadContent();
      })
      .catch(() => mounted && setMessage("Could not connect to the site manager."));
    return () => { mounted = false; };
  }, []);

  async function signIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    try {
      const response = await fetch("/api/admin/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "Could not sign in.");
      setSession({ configured: true, authenticated: true });
      setPassword("");
      await loadContent();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not sign in.");
    } finally {
      setBusy(false);
    }
  }

  async function signOut() {
    await fetch("/api/admin/session", { method: "DELETE" });
    setSession({ configured: true, authenticated: false });
    setContent(blankContent);
    setOverview(blankOverview);
    setMessage("You are signed out.");
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    try {
      const response = await fetch("/api/admin/content", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(content),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "Could not save changes.");
      setStorage(result.storage);
      setMessage("Saved. Your public site is updated.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not save changes.");
    } finally {
      setBusy(false);
    }
  }

  async function changePassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    if (newPassword !== confirmPassword) {
      setMessage("The new password and confirmation do not match.");
      return;
    }
    setBusy(true);
    try {
      const response = await fetch("/api/admin/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "Could not update the password.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setMessage("Password updated successfully.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not update the password.");
    } finally {
      setBusy(false);
    }
  }

  function updateBusiness(field: keyof SiteContent["business"], value: string | boolean) {
    setContent((current) => ({ ...current, business: { ...current.business, [field]: value } }));
  }

  function updateContact(field: "phone" | "whatsapp" | "email", value: string) {
    setContent((current) => ({ ...current, contact: { ...current.contact, [field]: value } }));
  }

  function updateSocial(field: keyof SiteContent["contact"]["socials"], value: string) {
    setContent((current) => ({ ...current, contact: { ...current.contact, socials: { ...current.contact.socials, [field]: value } } }));
  }

  const menuCount = content.menu.filter((item) => item.name.trim()).length;
  const publishedReviewCount = content.testimonials.filter((item) => item.isPublished && item.quote.trim() && item.author.trim()).length;
  const contactChannelCount = [
    content.contact.phone,
    content.contact.whatsapp,
    content.contact.email,
    ...Object.values(content.contact.socials),
  ].filter((value) => value.trim()).length;

  const pageCopy: Record<string, { eyebrow: string; title: string; description: string }> = {
    overview: { eyebrow: "OWNER WORKSPACE", title: "Dashboard", description: "Public site activity and content status." },
    menu: { eyebrow: "PUBLIC MENU", title: "Coffee menu", description: "Edit the drinks and prices shown on your public menu." },
    reviews: { eyebrow: "PUBLIC VISIT PAGE", title: "Guest reviews", description: "Add guest feedback and publish it when you have their permission." },
    "visit-details": { eyebrow: "PUBLIC VISIT PAGE", title: "Visit details", description: "Keep the address and opening hours accurate for guests." },
    "contact-social": { eyebrow: "PUBLIC CONTACT PAGE", title: "Contact & social", description: "Choose the contact details and social profiles guests can use." },
    "account-security": { eyebrow: "OWNER ACCOUNT", title: "Account security", description: "Update the password used to protect this workspace." },
    members: { eyebrow: "DAYMARK CIRCLE", title: "Circle members", description: "Guests who created an account on the website." },
  };
  const currentPage = pageCopy[activeSection] ?? pageCopy.overview;

  function navigateTo(section: string) {
    setActiveSection(section);
    if (section === "members") void loadMembers();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  if (!session) return <main className="admin-loading">Opening the site manager…</main>;

  if (!session.authenticated) {
    return (
      <main className="admin-auth-layout">
        <section className="admin-auth-brand">
          <a className="admin-auth-brand-link" href="/" aria-label="Daymark Coffee home"><span className="admin-brand-mark">D</span><span>DAYMARK<small>COFFEE</small></span></a>
          <div className="admin-auth-brand-copy"><span className="admin-eyebrow">PRIVATE OWNER WORKSPACE</span><h2>Keep good<br />things <em>moving.</em></h2><p>Update the menu, visit information, and the details guests use to find you.</p></div>
          <span className="admin-auth-edition">DAYMARK COFFEE · SITE MANAGER</span>
        </section>
        <section className="admin-auth-panel">
          <a className="admin-back-link" href="/">← Back to the public site</a>
          <div className="admin-login-card">
            <span className="admin-eyebrow">OWNER SIGN IN</span>
            <h1>Welcome<br /><em>back.</em></h1>
            <p className="admin-login-intro">Sign in to keep your café information current.</p>
            {session.configured ? (
              <form onSubmit={signIn} className="admin-form-stack">
                <label>Password<input type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} required /></label>
                <button className="admin-primary-button" disabled={busy}>{busy ? "Signing in…" : "Sign in to your workspace"}<span aria-hidden="true">↗</span></button>
              </form>
            ) : (
              <div className="admin-notice">
                <strong>One-time server setup needed</strong>
                <p>Set <code>ADMIN_PASSWORD</code> (at least 12 characters) and <code>ADMIN_SESSION_SECRET</code> (at least 32 random characters) in the site host’s environment, then restart the app. The password stays private and is never stored in the content file.</p>
              </div>
            )}
            {message && <p className="admin-status" role="status">{message}</p>}
            <p className="admin-login-footnote">Your workspace is private. Site changes are only published when you save.</p>
          </div>
        </section>
      </main>
    );
  }

  return (
    <div className="admin-dashboard">
      <aside className="admin-sidebar">
        <a className="admin-sidebar-brand" href="/" aria-label="Daymark Coffee home"><span className="admin-brand-mark">D</span><span>DAYMARK<small>COFFEE</small></span></a>
        <span className="admin-sidebar-caption">OWNER WORKSPACE</span>
        <nav className="admin-sidebar-nav" aria-label="Site manager sections">
          {adminNavItems.map((item) => (
            <button type="button" className={activeSection === item.id ? "is-active" : ""} key={item.id} aria-current={activeSection === item.id ? "page" : undefined} onClick={() => navigateTo(item.id)}><AdminIcon name={item.icon} />{item.label}</button>
          ))}
        </nav>
        <div className="admin-sidebar-bottom"><a href="/" target="_blank" rel="noreferrer">View public site <span>↗</span></a><button type="button" onClick={signOut}>Sign out <span>↗</span></button></div>
      </aside>

      <main className="admin-main">
        <div className="admin-mobile-topbar"><a className="admin-sidebar-brand" href="/" aria-label="Daymark Coffee home"><span className="admin-brand-mark">D</span><span>DAYMARK<small>COFFEE</small></span></a><button type="button" className="admin-quiet-button" onClick={signOut}>Sign out</button></div>
        <header className="admin-header" id="overview">
          <div><span className="admin-eyebrow">{currentPage.eyebrow}</span><h1>{currentPage.title}</h1><p className="admin-header-description">{currentPage.description}</p></div>
          <div className="admin-header-actions"><span className={`admin-storage-badge is-${storage}`}>{storage === "supabase" ? "Supabase connected" : "Local preview data"}</span></div>
        </header>
        {activeSection === "overview" && (
        <section className="admin-overview" aria-labelledby="admin-overview-title">
          <div className="admin-metric-grid">
            <article className="admin-metric-card"><span className="admin-metric-label">Page views · 30 days</span><strong>{overview.viewTrackingReady ? overview.pageViews30d?.toLocaleString() ?? "0" : "—"}</strong><p>Across the public website</p></article>
            <article className="admin-metric-card"><span className="admin-metric-label">Menu items</span><strong>{menuCount}</strong><p>Listed on the coffee menu</p><button type="button" onClick={() => navigateTo("menu")}>Edit menu <span aria-hidden="true">→</span></button></article>
            <article className="admin-metric-card"><span className="admin-metric-label">Published reviews</span><strong>{publishedReviewCount}</strong><p>{publishedReviewCount === 1 ? "Guest note on the Visit page" : "Guest notes on the Visit page"}</p><button type="button" onClick={() => navigateTo("reviews")}>Manage reviews <span aria-hidden="true">→</span></button></article>
            <article className="admin-metric-card"><span className="admin-metric-label">Contact channels</span><strong>{contactChannelCount}</strong><p>Phone, email, WhatsApp, and social</p><button type="button" onClick={() => navigateTo("contact-social")}>Edit contact <span aria-hidden="true">→</span></button></article>
          </div>
          <div className="admin-dashboard-grid">
            <section className="admin-chart-panel" aria-labelledby="admin-overview-title">
              <div className="admin-panel-heading"><div><span className="admin-metric-label">SITE ACTIVITY</span><h2 id="admin-overview-title">Page views</h2></div><span className="admin-range-label">Last 30 days</span></div>
              <PageViewsChart data={overview.dailyViews} available={overview.viewTrackingReady} />
              {!overview.viewTrackingReady && <p className="admin-analytics-note">Run the updated <code>supabase/schema.sql</code> in Supabase to begin collecting page views.</p>}
            </section>
            <section className="admin-site-status" aria-labelledby="admin-site-status-title">
              <div className="admin-panel-heading"><div><span className="admin-metric-label">PUBLIC WEBSITE</span><h2 id="admin-site-status-title">Content status</h2></div></div>
              <button type="button" className="admin-status-row" onClick={() => navigateTo("menu")}><span>Coffee menu</span><strong>{menuCount} items <span aria-hidden="true">→</span></strong></button>
              <button type="button" className="admin-status-row" onClick={() => navigateTo("reviews")}><span>Guest reviews</span><strong>{publishedReviewCount} published <span aria-hidden="true">→</span></strong></button>
              <button type="button" className="admin-status-row" onClick={() => navigateTo("visit-details")}><span>Visit details</span><strong>{content.business.isConfirmed ? "Confirmed" : "Temporary"} <span aria-hidden="true">→</span></strong></button>
              <button type="button" className="admin-status-row" onClick={() => navigateTo("contact-social")}><span>Contact details</span><strong>{contactChannelCount} channels <span aria-hidden="true">→</span></strong></button>
              <p className="admin-status-caption">Saved changes appear on the matching public page.</p>
            </section>
          </div>
          <div className="admin-dashboard-footer"><a className="admin-overview-preview" href="/" target="_blank" rel="noreferrer">Open public website <span aria-hidden="true">↗</span></a><span>Content is stored in {storage === "supabase" ? "Supabase" : "local preview data"}.</span></div>
        </section>
        )}
        {activeSection === "menu" || activeSection === "reviews" || activeSection === "visit-details" || activeSection === "contact-social" ? (
        <form className="admin-editor" id="site-content-form" onSubmit={save}>
        {activeSection === "menu" && <section className="admin-section" id="menu">
          <div className="admin-section-heading"><span>01</span><div><h2>Menu</h2><p>Update names, descriptions, and prices shown to guests.</p></div></div>
          <div className="admin-menu-items">
            {content.menu.map((item, index) => (
              <article className="admin-menu-row" key={item.id}>
                <div className="admin-menu-row-heading"><span>DRINK {String(index + 1).padStart(2, "0")}</span><button type="button" onClick={() => setContent((current) => ({ ...current, menu: current.menu.filter((drink) => drink.id !== item.id) }))}>Remove</button></div>
                <div className="admin-field-grid">
                  <label>Drink name<input value={item.name} onChange={(event) => setContent((current) => ({ ...current, menu: current.menu.map((drink) => drink.id === item.id ? { ...drink, name: event.target.value } : drink) }))} required maxLength={80} /></label>
                  <label>Price<input value={item.price} onChange={(event) => setContent((current) => ({ ...current, menu: current.menu.map((drink) => drink.id === item.id ? { ...drink, price: event.target.value } : drink) }))} placeholder="e.g. KES 250" maxLength={40} /></label>
                  <label className="admin-field-wide">Description<input value={item.note} onChange={(event) => setContent((current) => ({ ...current, menu: current.menu.map((drink) => drink.id === item.id ? { ...drink, note: event.target.value } : drink) }))} maxLength={240} /></label>
                </div>
              </article>
            ))}
          </div>
          <button type="button" className="admin-add-button" onClick={() => setContent((current) => ({ ...current, menu: [...current.menu, { id: crypto.randomUUID(), name: "", note: "", price: "" }] }))}>＋ Add a drink</button>
        </section>}

        {activeSection === "reviews" && <section className="admin-section" id="reviews">
          <div className="admin-section-heading"><span>02</span><div><h2>Guest reviews</h2><p>Share a guest’s words only after confirming you have permission to publish them.</p></div></div>
          <div className="admin-testimonial-list">
            {content.testimonials.map((item, index) => (
              <article className="admin-menu-row" key={item.id}>
                <div className="admin-menu-row-heading"><span>GUEST NOTE {String(index + 1).padStart(2, "0")}</span><button type="button" onClick={() => setContent((current) => ({ ...current, testimonials: current.testimonials.filter((review) => review.id !== item.id) }))}>Remove</button></div>
                <div className="admin-field-grid">
                  <label className="admin-field-wide">Guest’s words<textarea rows={4} value={item.quote} onChange={(event) => setContent((current) => ({ ...current, testimonials: current.testimonials.map((review) => review.id === item.id ? { ...review, quote: event.target.value } : review) }))} placeholder="Paste the guest’s exact words" maxLength={700} /></label>
                  <label>Display name<input value={item.author} onChange={(event) => setContent((current) => ({ ...current, testimonials: current.testimonials.map((review) => review.id === item.id ? { ...review, author: event.target.value } : review) }))} placeholder="Name approved by the guest" maxLength={100} /></label>
                  <label className="admin-testimonial-publish"><input type="checkbox" checked={item.isPublished} onChange={(event) => setContent((current) => ({ ...current, testimonials: current.testimonials.map((review) => review.id === item.id ? { ...review, isPublished: event.target.checked } : review) }))} /><span>Publish on the Visit page</span></label>
                </div>
              </article>
            ))}
          </div>
          <button type="button" className="admin-add-button" onClick={() => setContent((current) => ({ ...current, testimonials: [...current.testimonials, { id: crypto.randomUUID(), quote: "", author: "", isPublished: false }] }))}>＋ Add a guest note</button>
        </section>}

        {activeSection === "visit-details" && <section className="admin-section" id="visit-details">
          <div className="admin-section-heading"><span>02</span><div><h2>Visit details</h2><p>Keep the address and opening hours accurate.</p></div></div>
          <div className="admin-field-grid">
            <label className="admin-field-wide">Street address<input value={content.business.address} onChange={(event) => updateBusiness("address", event.target.value)} maxLength={180} /></label>
            <label>City or town<input value={content.business.city} onChange={(event) => updateBusiness("city", event.target.value)} maxLength={100} /></label>
            <label>Directions / landmark<input value={content.business.directions} onChange={(event) => updateBusiness("directions", event.target.value)} maxLength={300} /></label>
            <label className="admin-field-wide">Opening hours<textarea rows={3} value={content.business.hours} onChange={(event) => updateBusiness("hours", event.target.value)} maxLength={500} /></label>
          </div>
          <label className="admin-check"><input type="checkbox" checked={content.business.isConfirmed} onChange={(event) => updateBusiness("isConfirmed", event.target.checked)} /><span><strong>These visit details are confirmed</strong><small>When selected, the public site removes the “temporary” label.</small></span></label>
        </section>}

        {activeSection === "contact-social" && <section className="admin-section" id="contact-social">
          <div className="admin-section-heading"><span>03</span><div><h2>Contact &amp; social</h2><p>Only filled fields and valid profile links appear on the public site.</p></div></div>
          <div className="admin-field-grid">
            <label>Phone<input type="tel" value={content.contact.phone} onChange={(event) => updateContact("phone", event.target.value)} maxLength={40} /></label>
            <label>WhatsApp<input type="tel" value={content.contact.whatsapp} onChange={(event) => updateContact("whatsapp", event.target.value)} maxLength={40} /></label>
            <label className="admin-field-wide">Email<input type="email" value={content.contact.email} onChange={(event) => updateContact("email", event.target.value)} maxLength={150} /></label>
            {(["facebook", "instagram", "tiktok", "youtube"] as const).map((platform) => (
              <label key={platform}>{platform[0].toUpperCase() + platform.slice(1)} profile URL<input type="url" value={content.contact.socials[platform]} onChange={(event) => updateSocial(platform, event.target.value)} placeholder="https://…" /></label>
            ))}
          </div>
          <div className="admin-section-heading admin-subheading"><span>APP</span><div><h2>Mobile app</h2><p>Paste your store listings when your app is live. The download section stays hidden until at least one link is added.</p></div></div>
          <div className="admin-field-grid">
            <label>App Store link<input type="url" value={content.apps.appStore} onChange={(event) => setContent((current) => ({ ...current, apps: { ...current.apps, appStore: event.target.value } }))} placeholder="https://apps.apple.com/…" /></label>
            <label>Google Play link<input type="url" value={content.apps.playStore} onChange={(event) => setContent((current) => ({ ...current, apps: { ...current.apps, playStore: event.target.value } }))} placeholder="https://play.google.com/…" /></label>
          </div>
        </section>}

        <footer className="admin-save-bar">
          <p className="admin-status" role="status">{message || "Changes stay in draft until you save."}</p>
          <button className="admin-primary-button" type="submit" disabled={busy}>{busy ? "Saving…" : "Save and publish"}</button>
        </footer>
        </form>
        ) : null}

        {activeSection === "members" && <section className="admin-section" id="members">
          <div className="admin-section-heading"><span>05</span><div><h2>Circle members</h2><p>People who joined the Daymark Circle. Only contact those who chose to hear from you.</p></div></div>
          {membersError && <p className="admin-status" role="alert">{membersError}</p>}
          {members === null && !membersError && <p className="admin-status">Loading members…</p>}
          {members && (
            <>
              <div className="admin-members-summary">
                <span><strong>{members.length}</strong> {members.length === 1 ? "member" : "members"}</span>
                <span><strong>{members.filter((m) => m.marketingOptIn).length}</strong> want news</span>
                <a className="admin-add-button" href="/api/admin/members?format=csv" download>Download CSV</a>
              </div>
              {members.length === 0 ? (
                <p className="admin-status">No members yet. The sign-up page is at <code>/account/join</code>.</p>
              ) : (
                <div className="admin-members-table-wrap">
                  <table className="admin-members-table">
                    <thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Usual</th><th>News</th><th>Joined</th></tr></thead>
                    <tbody>
                      {members.map((m) => (
                        <tr key={m.email}>
                          <td>{m.fullName || "—"}{!m.emailConfirmed && <small> · unconfirmed</small>}</td>
                          <td>{m.email}</td>
                          <td>{m.phone || "—"}</td>
                          <td>{m.favouriteDrink || "—"}</td>
                          <td>{m.marketingOptIn ? "Yes" : "No"}</td>
                          <td>{new Date(m.joinedAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </section>}

        {activeSection === "account-security" && <section className="admin-section admin-security-section" id="account-security">
          <div className="admin-section-heading"><span>04</span><div><h2>Account security</h2><p>Change the owner password at any time. Use at least 12 characters.</p></div></div>
          <form className="admin-field-grid" onSubmit={changePassword}>
            <label>Current password<input type="password" autoComplete="current-password" value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} required /></label>
            <span />
            <label>New password<input type="password" autoComplete="new-password" minLength={12} value={newPassword} onChange={(event) => setNewPassword(event.target.value)} required /></label>
            <label>Confirm new password<input type="password" autoComplete="new-password" minLength={12} value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} required /></label>
            <div><button type="submit" className="admin-add-button" disabled={busy}>Update password</button></div>
          </form>
          {message && <p className="admin-status" role="status">{message}</p>}
        </section>}
      </main>
    </div>
  );
}
