import type { Metadata, Viewport } from "next";
import { Fraunces, Inter_Tight } from "next/font/google";
import "lenis/dist/lenis.css";
import "./globals.css";
import "./experience.css";
import "./pages.css";
import { PageTransition } from "./components/page-transition";
import { arrivingScript } from "./components/page-transition-script";
import { SiteSchema } from "./components/site-schema";
import { SiteViewTracker } from "./components/site-view-tracker";

// Self-hosted by next/font, so every device renders the same type with no external font requests.
const sans = Inter_Tight({ subsets: ["latin"], variable: "--font-sans", display: "swap" });
const serif = Fraunces({
  subsets: ["latin"],
  variable: "--font-serif",
  style: ["normal", "italic"],
  axes: ["opsz", "SOFT"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3010"),
  title: {
    default: "Daymark Coffee | Coffee for the day ahead",
    template: "%s",
  },
  description:
    "Follow Daymark coffee from bean to first pour, then find a place for your next cup.",
  openGraph: {
    siteName: "Daymark Coffee",
    title: "Daymark Coffee",
    description: "Good coffee, made one step at a time.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Daymark Coffee",
    description: "Good coffee, made one step at a time.",
  },
};

export const viewport: Viewport = {
  themeColor: "#f6f1e8",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // The head script may add data-arriving to <html> before React loads.
    <html lang="en" className={`${sans.variable} ${serif.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: arrivingScript }} />
      </head>
      {/* Browser extensions (e.g. Grammarly) add attributes to <body>; don't treat that as a hydration error. */}
      <body suppressHydrationWarning>
        <PageTransition />
        <a className="xp-skip" href="#main-content">Skip to content</a>
        <SiteViewTracker />
        {children}
        <SiteSchema />
      </body>
    </html>
  );
}
