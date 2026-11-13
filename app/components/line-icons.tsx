/** Thin line icons that match the site's 1.5px arrow style. Decorative: always aria-hidden. */
type IconName = "phone" | "chat" | "mail" | "heart" | "pin" | "clock" | "cup" | "bean" | "flame" | "grind" | "drop" | "calendar";

const paths: Record<IconName, React.ReactNode> = {
  phone: <path d="M6.6 3.5h2.6l1.3 4.1-2 1.4a12 12 0 0 0 6.5 6.5l1.4-2 4.1 1.3v2.6a2 2 0 0 1-2.1 2A16.5 16.5 0 0 1 4.6 5.6a2 2 0 0 1 2-2.1Z" />,
  chat: <path d="M4.5 18.5 5.7 15A7.5 7.5 0 1 1 9 18.3l-4.5.2ZM9 10.5h6M9 13.5h4" />,
  mail: <><rect x="3.5" y="5.5" width="17" height="13" rx="2.5" /><path d="m4.5 7 7.5 6 7.5-6" /></>,
  heart: <><rect x="4" y="4" width="16" height="16" rx="5" /><circle cx="12" cy="12" r="3.6" /><circle cx="16.6" cy="7.4" r=".6" fill="currentColor" /></>,
  pin: <><path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 1 1 13 0c0 5.4-6.5 11-6.5 11Z" /><circle cx="12" cy="10" r="2.4" /></>,
  clock: <><circle cx="12" cy="12" r="8.5" /><path d="M12 7.5V12l3 2" /></>,
  cup: <><path d="M5 9.5h11v4.5a5 5 0 0 1-5 5h-1a5 5 0 0 1-5-5V9.5Z" /><path d="M16 11h1.2a2.3 2.3 0 0 1 0 4.6H16M8.5 3.5c-.8 1 .8 2 0 3M12 3.5c-.8 1 .8 2 0 3" /></>,
  bean: <><ellipse cx="12" cy="12" rx="6.5" ry="8.5" transform="rotate(-28 12 12)" /><path d="M15.2 4.8c-3.6 2.8-3.9 5.4-2.1 7.7 1.8 2.4 1.5 4.8-2.6 6.9" /></>,
  flame: <path d="M12 21a6 6 0 0 0 6-6c0-3.6-2.6-5.4-3.5-8.5-1.5 1.6-2 3.2-1.8 4.7C11.4 10 10.6 8.4 10.8 6 8 8.2 6 11.3 6 15a6 6 0 0 0 6 6Z" />,
  grind: <><path d="M7 4.5h10l-1.5 5h-7L7 4.5Z" /><rect x="6" y="9.5" width="12" height="10" rx="2" /><path d="M10 14.5h4M17 7h2.5" /></>,
  drop: <path d="M12 3.5s6 6.4 6 10.5a6 6 0 0 1-12 0c0-4.1 6-10.5 6-10.5Z" />,
  calendar: <><rect x="4" y="5.5" width="16" height="14" rx="2.5" /><path d="M4 10h16M8.5 3.5v4M15.5 3.5v4" /></>,
};

export function LineIcon({ name, className }: { name: IconName; className?: string }) {
  return (
    <svg
      className={`line-icon ${className ?? ""}`}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {paths[name]}
    </svg>
  );
}
