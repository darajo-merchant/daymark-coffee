import "server-only";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import { assertSupabaseEnvironment, getSupabaseAdmin, isSupabaseConfigured } from "./supabase";

export type MenuItem = { id: string; name: string; note: string; price: string };
export type GuestTestimonial = { id: string; quote: string; author: string; isPublished: boolean };
export type SiteContent = {
  business: { address: string; city: string; directions: string; hours: string; isConfirmed: boolean };
  contact: { phone: string; whatsapp: string; email: string; socials: Record<"facebook" | "instagram" | "tiktok" | "youtube", string> };
  menu: MenuItem[];
  testimonials: GuestTestimonial[];
  /** Official store listings for the café's app; empty until the owner adds them. */
  apps: { appStore: string; playStore: string };
};

export const defaultSiteContent: SiteContent = {
  business: {
    address: "Hasco Towers, 2nd floor, A203",
    city: "",
    directions: "",
    hours: "Saturday–Thursday\n8:00 AM–5:00 PM",
    isConfirmed: false,
  },
  contact: {
    phone: "",
    whatsapp: "",
    email: "",
    socials: { facebook: "", instagram: "", tiktok: "", youtube: "" },
  },
  menu: [
    { id: "espresso", name: "Espresso", note: "A short, concentrated coffee with a rich finish.", price: "" },
    { id: "americano", name: "Americano", note: "Espresso softened with hot water.", price: "" },
    { id: "cappuccino", name: "Cappuccino", note: "Espresso, steamed milk, and a light layer of foam.", price: "" },
    { id: "flat-white", name: "Flat white", note: "Espresso with silky steamed milk.", price: "" },
    { id: "latte", name: "Latte", note: "Espresso and smooth steamed milk, made for a longer sip.", price: "" },
    { id: "mocha", name: "Mocha", note: "Espresso, chocolate, and steamed milk in one comforting cup.", price: "" },
  ],
  testimonials: [],
  apps: { appStore: "", playStore: "" },
};

const contentPath = path.join(process.cwd(), "data", "site-content.json");
const maxTextLength = 800;

function cleanText(value: unknown, label: string, limit = maxTextLength): string {
  if (typeof value !== "string") throw new Error(`${label} must be text.`);
  const clean = value.trim();
  if (clean.length > limit) throw new Error(`${label} must be ${limit} characters or fewer.`);
  return clean;
}

function cleanSocialUrl(value: unknown, label: string): string {
  const clean = cleanText(value, label, 300);
  if (!clean) return "";
  try {
    const url = new URL(clean);
    if (url.protocol !== "https:" && url.protocol !== "http:") throw new Error();
    return url.toString();
  } catch {
    throw new Error(`${label} must be a valid http or https URL.`);
  }
}

/** Accepts only a real store listing (e.g. apps.apple.com), so badges can't point anywhere else. */
function cleanStoreUrl(value: unknown, label: string, hosts: string[]): string {
  const clean = cleanText(value ?? "", label, 300);
  if (!clean) return "";
  try {
    const url = new URL(clean);
    if (url.protocol !== "https:" || !hosts.includes(url.hostname)) throw new Error();
    return url.toString();
  } catch {
    throw new Error(`${label} must be an https link on ${hosts[0]}.`);
  }
}

export function validateSiteContent(input: unknown): SiteContent {
  if (!input || typeof input !== "object") throw new Error("The submitted site information is invalid.");
  const value = input as Record<string, any>;
  const business = value.business;
  const contact = value.contact;
  const socials = contact?.socials;
  if (!business || !contact || !socials || !Array.isArray(value.menu)) {
    throw new Error("Complete all dashboard sections before saving.");
  }
  if (value.menu.length > 40) throw new Error("The menu can contain up to 40 items.");
  const ids = new Set<string>();
  const menu = value.menu.map((item: Record<string, unknown>, index: number) => {
    const name = cleanText(item?.name, `Menu item ${index + 1} name`, 80);
    const id = cleanText(item?.id, `Menu item ${index + 1} ID`, 80);
    if (!name || !id || ids.has(id)) throw new Error("Menu items need a name and unique ID.");
    ids.add(id);
    return {
      id,
      name,
      note: cleanText(item?.note, `${name} description`, 240),
      price: cleanText(item?.price, `${name} price`, 40),
    };
  });
  const submittedTestimonials = value.testimonials ?? [];
  if (!Array.isArray(submittedTestimonials) || submittedTestimonials.length > 30) {
    throw new Error("The site can contain up to 30 guest testimonials.");
  }
  const testimonialIds = new Set<string>();
  const testimonials = submittedTestimonials.map((item: Record<string, unknown>, index: number) => {
    const id = cleanText(item?.id, `Testimonial ${index + 1} ID`, 80);
    const quote = cleanText(item?.quote, `Testimonial ${index + 1} quote`, 700);
    const author = cleanText(item?.author, `Testimonial ${index + 1} name`, 100);
    const isPublished = item?.isPublished === true;
    if (!id || testimonialIds.has(id)) throw new Error("Guest testimonials need unique IDs.");
    if (isPublished && (!quote || !author)) throw new Error("Published testimonials need both a quote and a guest name.");
    testimonialIds.add(id);
    return { id, quote, author, isPublished };
  });
  return {
    business: {
      address: cleanText(business.address, "Address", 180),
      city: cleanText(business.city, "City", 100),
      directions: cleanText(business.directions, "Directions", 300),
      hours: cleanText(business.hours, "Opening hours", 500),
      isConfirmed: business.isConfirmed === true,
    },
    contact: {
      phone: cleanText(contact.phone, "Phone number", 40),
      whatsapp: cleanText(contact.whatsapp, "WhatsApp number", 40),
      email: cleanText(contact.email, "Email address", 150),
      socials: {
        facebook: cleanSocialUrl(socials.facebook, "Facebook URL"),
        instagram: cleanSocialUrl(socials.instagram, "Instagram URL"),
        tiktok: cleanSocialUrl(socials.tiktok, "TikTok URL"),
        youtube: cleanSocialUrl(socials.youtube, "YouTube URL"),
      },
    },
    menu,
    testimonials,
    // Older saved content has no `apps` block; treat that as "no app yet".
    apps: {
      appStore: cleanStoreUrl(value.apps?.appStore, "App Store link", ["apps.apple.com"]),
      playStore: cleanStoreUrl(value.apps?.playStore, "Google Play link", ["play.google.com"]),
    },
  };
}

async function getLocalSiteContent(): Promise<SiteContent> {
  try {
    const saved = await readFile(contentPath, "utf8");
    return validateSiteContent(JSON.parse(saved));
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return defaultSiteContent;
    throw error;
  }
}

export async function getSiteContent(): Promise<SiteContent> {
  assertSupabaseEnvironment();
  if (isSupabaseConfigured()) {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("site_content")
      .select("content")
      .eq("id", "default")
      .maybeSingle();
    if (error) throw new Error(`Supabase could not load site content: ${error.message}`);
    if (data) return validateSiteContent(data.content);

    // On the first connected read, carry any existing local edits into Supabase.
    const initialContent = await getLocalSiteContent();
    const { error: seedError } = await supabase.from("site_content").upsert({
      id: "default",
      content: initialContent,
    }, { onConflict: "id" });
    if (seedError) throw new Error(`Supabase could not initialize site content: ${seedError.message}`);
    return initialContent;
  }
  return getLocalSiteContent();
}

export async function saveSiteContent(input: unknown): Promise<void> {
  const content = validateSiteContent(input);
  assertSupabaseEnvironment();
  if (isSupabaseConfigured()) {
    const { error } = await getSupabaseAdmin().from("site_content").upsert({
      id: "default",
      content,
      updated_at: new Date().toISOString(),
    }, { onConflict: "id" });
    if (error) throw new Error(`Supabase could not save site content: ${error.message}`);
    return;
  }
  const directory = path.dirname(contentPath);
  await mkdir(directory, { recursive: true });
  const temporaryPath = `${contentPath}.tmp`;
  await writeFile(temporaryPath, `${JSON.stringify(content, null, 2)}\n`, { encoding: "utf8", mode: 0o600 });
  await rename(temporaryPath, contentPath);
}
