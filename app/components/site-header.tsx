"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { usePathname } from "next/navigation";
import { ArrowIcon } from "./arrow-icon";
import { getLenis } from "./smooth-scroll";

const navItems = [
  { label: "Home", href: "/" },
  { label: "Menu", href: "/menu" },
  { label: "How it’s made", section: "ritual" },
  { label: "Visit", href: "/visit" },
  { label: "Our story", href: "/our-story" },
  { label: "Contact", href: "/contact" },
  // Desktop shows the account as an icon button instead, to keep the bar on one line.
  { label: "Account", href: "/account", mobileOnly: true },
];

export function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [portalTarget, setPortalTarget] = useState<HTMLElement | null>(null);
  const menuToggleRef = useRef<HTMLButtonElement>(null);
  const headerRef = useRef<HTMLElement>(null);
  const mobileNavRef = useRef<HTMLElement>(null);
  const pathname = usePathname();
  const isHome = pathname === "/";

  const sectionHref = (section: string) => isHome ? `#${section}` : `/#${section}`;
  const resolvedNavItems = navItems.map((item) => ({
    ...item,
    href: typeof item.section === "string" ? sectionHref(item.section) : item.href,
  }));
  // On the home page, the menu follows the scroll: "How it's made" while the coffee story is on screen.
  const [inRitual, setInRitual] = useState(false);
  useEffect(() => {
    setInRitual(false);
    if (!isHome) return;
    const ritual = document.getElementById("ritual");
    if (!ritual) return;
    // "In the story" = it covers the middle of the screen (true for its whole pinned run).
    let frame = 0;
    const check = () => {
      frame = 0;
      const rect = ritual.getBoundingClientRect();
      const middle = window.innerHeight / 2;
      setInRitual(rect.top <= middle && rect.bottom >= middle);
    };
    const schedule = () => { if (!frame) frame = window.requestAnimationFrame(check); };
    check();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [isHome]);

  const currentSection = (label: string) => isHome && inRitual && label === "How it’s made";
  const currentPage = (label: string) =>
    (label === "Home" && pathname === "/" && !inRitual) ||
    (label === "Menu" && pathname === "/menu") ||
    (label === "Visit" && pathname === "/visit") ||
    (label === "Our story" && pathname === "/our-story") ||
    (label === "Contact" && pathname === "/contact") ||
    (label === "Account" && pathname.startsWith("/account"));

  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    setPortalTarget(document.body);
    const update = () => setScrolled(window.scrollY > 24);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    // Smooth scrolling would otherwise keep moving the page behind the open menu.
    getLenis()?.stop();

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
        menuToggleRef.current?.focus();
      }
    };
    const closeOnOutsidePointer = (event: PointerEvent) => {
      if (
        event.target instanceof Node &&
        !headerRef.current?.contains(event.target) &&
        !mobileNavRef.current?.contains(event.target)
      ) {
        setMenuOpen(false);
      }
    };

    window.addEventListener("keydown", closeOnEscape);
    document.addEventListener("pointerdown", closeOnOutsidePointer);
    return () => {
      document.body.style.overflow = previousOverflow;
      getLenis()?.start();
      window.removeEventListener("keydown", closeOnEscape);
      document.removeEventListener("pointerdown", closeOnOutsidePointer);
    };
  }, [menuOpen]);

  useEffect(() => setMenuOpen(false), [pathname]);

  const closeMenu = () => setMenuOpen(false);
  const mobileNavigation = (
    <nav
      ref={mobileNavRef}
      id="mobile-navigation"
      className={`mobile-nav ${menuOpen ? "is-open" : ""}`}
      aria-label="Mobile navigation"
      aria-hidden={!menuOpen}
      inert={!menuOpen}
    >
      {resolvedNavItems.map((item, index) => (
        <a
          key={item.label}
          href={item.href}
          onClick={closeMenu}
          tabIndex={menuOpen ? 0 : -1}
          aria-current={currentPage(item.label) ? "page" : currentSection(item.label) ? "location" : undefined}
        >
          <span>0{index + 1}</span>{item.label}<ArrowIcon direction="up-right" />
        </a>
      ))}
    </nav>
  );

  return (
    <>
      <header
        ref={headerRef}
        className={`site-header z-30 mx-auto flex items-center justify-between ${menuOpen ? "menu-open" : ""} ${scrolled ? "is-scrolled" : ""}`}
      >
        <a className="wordmark" href={isHome ? "#top" : "/#top"} aria-label="Daymark Coffee home" onClick={closeMenu}>
          <span className="wordmark-symbol" aria-hidden="true">D</span>
          <span className="wordmark-name">DAYMARK<span>COFFEE</span></span>
        </a>

        <nav className="primary-nav" aria-label="Main navigation">
          {resolvedNavItems.filter((item) => !item.mobileOnly).map((item) => (
            <a
              key={item.label}
              href={item.href}
              onClick={closeMenu}
              aria-current={currentPage(item.label) ? "page" : currentSection(item.label) ? "location" : undefined}
            >
              {item.label}
            </a>
          ))}
        </nav>

        <a
          className="header-account"
          href="/account"
          aria-label="Your Daymark account"
          title="Your account"
          aria-current={currentPage("Account") ? "page" : undefined}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden="true">
            <circle cx="12" cy="8.5" r="3.6" />
            <path d="M4.8 20a7.2 7.2 0 0 1 14.4 0" />
          </svg>
        </a>

        <a className="header-cta" href={isHome ? "#coffee" : "/visit"} onClick={closeMenu}>
          Find us <ArrowIcon direction="up-right" />
        </a>

        <button
          ref={menuToggleRef}
          className={`menu-toggle ${menuOpen ? "is-open" : ""}`}
          type="button"
          aria-label={menuOpen ? "Close navigation" : "Open navigation"}
          aria-expanded={menuOpen}
          aria-controls="mobile-navigation"
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span />
          <span />
        </button>
      </header>
      {portalTarget ? createPortal(mobileNavigation, portalTarget) : mobileNavigation}
    </>
  );
}
