type SocialPlatform = "Facebook" | "Instagram" | "TikTok" | "YouTube";

type SocialUrls = { facebook: string; instagram: string; tiktok: string; youtube: string };

function SocialIcon({ platform }: { platform: SocialPlatform }) {
  if (platform === "Facebook") {
    return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M13.5 21v-8h2.7l.4-3h-3.1V8.1c0-.9.3-1.5 1.6-1.5h1.7V3.9c-.3 0-1.4-.1-2.7-.1-2.7 0-4.5 1.7-4.5 4.7V10H6.8v3h2.8v8h3.9Z" /></svg>;
  }

  if (platform === "Instagram") {
    return <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle className="social-icon-dot" cx="18" cy="6" r="1" /></svg>;
  }

  if (platform === "TikTok") {
    return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19.6 7.3a5.2 5.2 0 0 1-3.2-1.1v8.1a5.3 5.3 0 1 1-5.3-5.3c.4 0 .8 0 1.1.1v3.1a2.2 2.2 0 1 0 1.1 1.9V2.9h3.1a5.2 5.2 0 0 0 3.2 4.4v3.2Z" /></svg>;
  }

  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M23 7.1a3 3 0 0 0-2.1-2.2C19.1 4.4 12 4.4 12 4.4s-7.1 0-8.9.5A3 3 0 0 0 1 7.1 31 31 0 0 0 .5 12a31 31 0 0 0 .5 4.9 3 3 0 0 0 2.1 2.2c1.8.5 8.9.5 8.9.5s7.1 0 8.9-.5a3 3 0 0 0 2.1-2.2 31 31 0 0 0 .5-4.9 31 31 0 0 0-.5-4.9ZM9.7 15.5v-7l6.1 3.5-6.1 3.5Z" /></svg>;
}

export function SocialLinks({ urls }: { urls: SocialUrls }) {
  const socialLinks: { platform: SocialPlatform; href: string | null }[] = [
    { platform: "Facebook", href: urls.facebook || null },
    { platform: "Instagram", href: urls.instagram || null },
    { platform: "TikTok", href: urls.tiktok || null },
    { platform: "YouTube", href: urls.youtube || null },
  ];
  return (
    <div className="social-links" aria-label="Daymark Coffee social media">
      {socialLinks.map(({ platform, href }) => {
        const content = <><SocialIcon platform={platform} /><span>{platform}</span></>;

        return href ? (
          <a className="social-link" href={href} key={platform} target="_blank" rel="noreferrer" aria-label={`Follow Daymark Coffee on ${platform}`}>
            {content}
          </a>
        ) : (
          <span className="social-link is-pending" key={platform} aria-label={`${platform} profile link not connected`} title={`${platform} profile link not connected`}>
            {content}
          </span>
        );
      })}
    </div>
  );
}
