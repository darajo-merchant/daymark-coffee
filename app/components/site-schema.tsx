import { getSiteContent } from "../../lib/site-content";

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3010";

/**
 * JSON-LD so search engines list the site as a café, built only from
 * details the owner has actually provided in the dashboard.
 */
export async function SiteSchema() {
  const { business, contact } = await getSiteContent();

  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "CafeOrCoffeeShop",
    name: "Daymark Coffee",
    description: "Follow Daymark coffee from bean to first pour, then find a place for your next cup.",
    url: baseUrl,
    image: `${baseUrl}/opengraph-image.jpg`,
    servesCuisine: "Coffee",
  };
  if (business.address) {
    schema.address = {
      "@type": "PostalAddress",
      streetAddress: business.address,
      ...(business.city ? { addressLocality: business.city } : {}),
    };
  }
  if (contact.phone) schema.telephone = contact.phone;
  if (contact.email) schema.email = contact.email;
  const socials = Object.values(contact.socials).filter(Boolean);
  if (socials.length) schema.sameAs = socials;

  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
  );
}
