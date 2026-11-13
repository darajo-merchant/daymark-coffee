import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  // LAN addresses allowed to load dev assets: home Wi-Fi, plus the iPhone hotspot range (always 172.20.10.2–14).
  allowedDevOrigins: [
    "192.168.8.35",
    ...Array.from({ length: 13 }, (_, index) => `172.20.10.${index + 2}`),
  ],
  // The About page became Our Story; keep old links and search results working.
  async redirects() {
    return [{ source: "/about", destination: "/our-story", permanent: true }];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
};

export default nextConfig;
