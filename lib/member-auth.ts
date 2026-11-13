import "server-only";
import { createHmac, createHash, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { createClient, type SupabaseClient, type User } from "@supabase/supabase-js";
import { getSupabaseAdmin, isSupabaseConfigured } from "./supabase";

/**
 * Daymark Circle members.
 *
 * Passwords, confirmation emails and user records live in Supabase Auth. After
 * Supabase accepts a password we keep our own signed, HttpOnly session cookie
 * (same pattern as the owner dashboard, separate name and signing domain), so
 * no Supabase key ever reaches the browser.
 */

const cookieName = "daymark_member";
const sessionDuration = 30 * 24 * 60 * 60 * 1000;

export type MemberProfile = {
  email: string;
  fullName: string;
  phone: string;
  birthday: string; // "MM-DD" or ""
  favouriteDrink: string;
  marketingOptIn: boolean;
  joinedAt: string;
  emailConfirmed: boolean;
};

export function membersAvailable(): boolean {
  return isSupabaseConfigured() && Boolean(process.env.ADMIN_SESSION_SECRET && process.env.ADMIN_SESSION_SECRET.length >= 32);
}

/** A throwaway client for sign-up / sign-in so the shared admin client never takes on a member's identity. */
export function freshAuthClient(): SupabaseClient {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Member accounts need Supabase to be configured.");
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false } });
}

function sign(payload: string): string {
  // "member:" keeps these signatures from ever matching an owner-session signature.
  return createHmac("sha256", process.env.ADMIN_SESSION_SECRET ?? "").update(`member:${payload}`).digest("hex");
}

function safeEqual(left: string, right: string): boolean {
  return timingSafeEqual(createHash("sha256").update(left).digest(), createHash("sha256").update(right).digest());
}

export async function setMemberSession(userId: string): Promise<void> {
  const payload = `${userId}.${Date.now()}`;
  (await cookies()).set(cookieName, `${payload}.${sign(payload)}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: sessionDuration / 1000,
  });
}

export async function clearMemberSession(): Promise<void> {
  (await cookies()).set(cookieName, "", { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: 0 });
}

export async function getMemberId(): Promise<string | null> {
  if (!membersAvailable()) return null;
  const value = (await cookies()).get(cookieName)?.value;
  if (!value) return null;
  const parts = value.split(".");
  if (parts.length !== 3) return null;
  const [userId, issued, signature] = parts;
  if (!/^[0-9a-f-]{36}$/i.test(userId) || !/^\d+$/.test(issued)) return null;
  const issuedAt = Number(issued);
  if (Date.now() - issuedAt > sessionDuration || issuedAt > Date.now() + 60_000) return null;
  return safeEqual(signature, sign(`${userId}.${issued}`)) ? userId : null;
}

export function profileFromUser(user: User): MemberProfile {
  const meta = (user.user_metadata ?? {}) as Record<string, unknown>;
  const text = (key: string) => (typeof meta[key] === "string" ? (meta[key] as string) : "");
  return {
    email: user.email ?? "",
    fullName: text("full_name"),
    phone: text("phone"),
    birthday: text("birthday"),
    favouriteDrink: text("favourite_drink"),
    marketingOptIn: meta.marketing_opt_in === true,
    joinedAt: user.created_at,
    emailConfirmed: Boolean(user.email_confirmed_at),
  };
}

/**
 * True only when the cookie is valid AND the Supabase user still exists.
 * Join/sign-in pages use this, so a cookie for a deleted account can't bounce
 * the visitor between /account and /account/sign-in forever.
 */
export async function hasLiveMemberSession(): Promise<boolean> {
  const userId = await getMemberId();
  if (!userId) return false;
  return Boolean(await getMemberProfile(userId).catch(() => null));
}

export async function getMemberProfile(userId: string): Promise<MemberProfile | null> {
  const { data, error } = await getSupabaseAdmin().auth.admin.getUserById(userId);
  if (error || !data.user) return null;
  return profileFromUser(data.user);
}

/* ---- Input validation shared by join and profile updates ---------------- */

function cleanField(value: unknown, label: string, max: number): string {
  if (value === undefined || value === null) return "";
  if (typeof value !== "string") throw new Error(`${label} must be text.`);
  const clean = value.trim();
  if (clean.length > max) throw new Error(`${label} must be ${max} characters or fewer.`);
  return clean;
}

export function cleanProfileInput(body: Record<string, unknown>) {
  const fullName = cleanField(body.fullName, "Name", 80);
  if (!fullName) throw new Error("Please tell us your name.");
  const phone = cleanField(body.phone, "Phone", 30);
  if (phone && !/^[+\d][\d\s()-]{5,}$/.test(phone)) throw new Error("Please enter a valid phone number, or leave it empty.");
  const birthday = cleanField(body.birthday, "Birthday", 5);
  if (birthday && !/^(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/.test(birthday)) throw new Error("Please choose a valid birthday, or leave it empty.");
  const favouriteDrink = cleanField(body.favouriteDrink, "Favourite drink", 80);
  return { fullName, phone, birthday, favouriteDrink, marketingOptIn: body.marketingOptIn === true };
}

export function metadataFromProfile(profile: ReturnType<typeof cleanProfileInput>) {
  return {
    full_name: profile.fullName,
    phone: profile.phone,
    birthday: profile.birthday,
    favourite_drink: profile.favouriteDrink,
    marketing_opt_in: profile.marketingOptIn,
  };
}

export function cleanEmail(value: unknown): string {
  const email = cleanField(value, "Email", 150).toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error("Please enter a valid email address.");
  return email;
}

/* ---- Simple per-IP attempt limit for join and sign-in ------------------- */

const attempts = new Map<string, { count: number; resetAt: number }>();

export function allowAttempt(request: Request, bucket: string, limit = 8, windowMs = 10 * 60 * 1000): boolean {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "local";
  const key = `${bucket}:${ip}`;
  const now = Date.now();
  const entry = attempts.get(key);
  if (!entry || entry.resetAt < now) {
    attempts.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  entry.count += 1;
  return entry.count <= limit;
}

export function siteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3010";
}
