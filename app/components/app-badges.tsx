type Apps = { appStore: string; playStore: string };

/** Store badges for the café app. Renders nothing until the owner adds a real link. */
export function AppBadges({ apps, tone = "dark" }: { apps: Apps; tone?: "dark" | "light" }) {
  if (!apps.appStore && !apps.playStore) return null;
  return (
    <div className={`xp-app-badges is-${tone}`}>
      {apps.appStore && (
        <a className="xp-app-badge" href={apps.appStore} target="_blank" rel="noreferrer" aria-label="Download on the App Store">
          <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <path fill="currentColor" d="M16.4 12.6c0-2.4 2-3.6 2.1-3.6-1.1-1.7-2.9-1.9-3.5-1.9-1.5-.2-2.9.9-3.7.9-.8 0-1.9-.9-3.2-.8-1.6 0-3.1 1-4 2.4-1.7 3-.4 7.4 1.2 9.8.8 1.2 1.8 2.5 3 2.4 1.2 0 1.7-.8 3.1-.8 1.5 0 1.9.8 3.2.8 1.3 0 2.1-1.2 2.9-2.4.9-1.4 1.3-2.7 1.3-2.8 0 0-2.4-.9-2.4-4Zm-2.4-7.1c.7-.8 1.1-1.9 1-3-1 0-2.1.7-2.8 1.5-.6.7-1.2 1.8-1 2.9 1 .1 2.1-.6 2.8-1.4Z" />
          </svg>
          <span><small>Download on the</small>App Store</span>
        </a>
      )}
      {apps.playStore && (
        <a className="xp-app-badge" href={apps.playStore} target="_blank" rel="noreferrer" aria-label="Get it on Google Play">
          <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <path fill="#34a853" d="M3.6 2.3 13.4 12l-9.8 9.7c-.4-.2-.6-.6-.6-1.1V3.4c0-.5.2-.9.6-1.1Z" />
            <path fill="#fbbc04" d="m16.6 15.2-3.2-3.2 3.2-3.2 3.7 2.1c1 .6 1 1.6 0 2.2l-3.7 2.1Z" />
            <path fill="#ea4335" d="M16.6 15.2 13.4 12l-9.8 9.7c.4.2.9.2 1.4-.1l11.6-6.4Z" />
            <path fill="#4285f4" d="M16.6 8.8 5 2.4c-.5-.3-1-.3-1.4-.1l9.8 9.7 3.2-3.2Z" />
          </svg>
          <span><small>Get it on</small>Google Play</span>
        </a>
      )}
    </div>
  );
}
