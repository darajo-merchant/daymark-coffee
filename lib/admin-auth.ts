import "server-only";
import { createHash, createHmac, randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import { readFile, mkdir, rename, writeFile } from "node:fs/promises";
import { cookies } from "next/headers";
import path from "node:path";

const cookieName = "daymark_admin";
const sessionDuration = 12 * 60 * 60 * 1000;

type PasswordRecord = { salt: string; hash: string };
const passwordFile = path.join(process.cwd(), "data", "admin-auth.json");

function sessionSecretReady(): boolean {
  return Boolean(process.env.ADMIN_SESSION_SECRET && process.env.ADMIN_SESSION_SECRET.length >= 32);
}

function signature(timestamp: string): string {
  return createHmac("sha256", process.env.ADMIN_SESSION_SECRET ?? "").update(timestamp).digest("hex");
}

function safeEqual(left: string, right: string): boolean {
  const leftHash = createHash("sha256").update(left).digest();
  const rightHash = createHash("sha256").update(right).digest();
  return timingSafeEqual(leftHash, rightHash);
}

async function readPasswordRecord(): Promise<PasswordRecord | null> {
  try {
    return JSON.parse(await readFile(passwordFile, "utf8")) as PasswordRecord;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return null;
    throw error;
  }
}

function passwordHash(password: string, salt: string): Promise<Buffer> {
  return new Promise((resolve, reject) => scrypt(password, salt, 64, (error, derived) => error ? reject(error) : resolve(derived as Buffer)));
}

async function savePasswordRecord(password: string): Promise<void> {
  const directory = path.dirname(passwordFile);
  await mkdir(directory, { recursive: true });
  const salt = randomBytes(16).toString("hex");
  const hash = (await passwordHash(password, salt)).toString("hex");
  const temporaryPath = `${passwordFile}.tmp`;
  await writeFile(temporaryPath, `${JSON.stringify({ salt, hash })}\n`, { encoding: "utf8", mode: 0o600 });
  await rename(temporaryPath, passwordFile);
}

export async function isAdminConfigured(): Promise<boolean> {
  if (!sessionSecretReady()) return false;
  const savedPassword = await readPasswordRecord();
  return Boolean(savedPassword || (process.env.ADMIN_PASSWORD && process.env.ADMIN_PASSWORD.length >= 12));
}

export async function checkAdminPassword(password: string): Promise<boolean> {
  if (!sessionSecretReady()) return false;
  const savedPassword = await readPasswordRecord();
  if (savedPassword) {
    const candidate = await passwordHash(password, savedPassword.salt);
    return safeEqual(candidate.toString("hex"), savedPassword.hash);
  }
  return Boolean(process.env.ADMIN_PASSWORD && process.env.ADMIN_PASSWORD.length >= 12 && safeEqual(password, process.env.ADMIN_PASSWORD));
}

export async function initializeAdminPassword(password: string): Promise<void> {
  if (!(await readPasswordRecord())) await savePasswordRecord(password);
}

export async function changeAdminPassword(currentPassword: string, newPassword: string): Promise<boolean> {
  if (newPassword.length < 12) throw new Error("Choose a password with at least 12 characters.");
  if (!(await checkAdminPassword(currentPassword))) return false;
  await savePasswordRecord(newPassword);
  return true;
}

export async function isAdminAuthenticated(): Promise<boolean> {
  if (!(await isAdminConfigured())) return false;
  const value = (await cookies()).get(cookieName)?.value;
  if (!value) return false;
  const [timestamp, suppliedSignature] = value.split(".");
  if (!timestamp || !suppliedSignature || !/^\d+$/.test(timestamp)) return false;
  const issued = Number(timestamp);
  if (!Number.isSafeInteger(issued) || Date.now() - issued > sessionDuration || issued > Date.now() + 60_000) return false;
  return safeEqual(suppliedSignature, signature(timestamp));
}

export async function setAdminSession(): Promise<void> {
  const timestamp = String(Date.now());
  (await cookies()).set(cookieName, `${timestamp}.${signature(timestamp)}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/api/admin",
    maxAge: sessionDuration / 1000,
  });
}

export async function clearAdminSession(): Promise<void> {
  (await cookies()).set(cookieName, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/api/admin",
    maxAge: 0,
  });
}

export function requestIsSameOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return false;
  try {
    const originUrl = new URL(origin);
    const requestUrl = new URL(request.url);
    if (originUrl.origin === requestUrl.origin) return true;

    // A local reverse proxy can expose the site on a different host/port than
    // the internal Next.js request URL. Compare against the public request
    // authority in Host / forwarded headers as well.
    const firstHeaderValue = (name: string) => request.headers.get(name)?.split(",")[0]?.trim();
    const hosts = [firstHeaderValue("host"), firstHeaderValue("x-forwarded-host")]
      .filter((value): value is string => Boolean(value))
      .map((value) => value.toLowerCase());
    const protocols = [requestUrl.protocol, firstHeaderValue("x-forwarded-proto")]
      .filter((value): value is string => Boolean(value))
      .map((value) => value.endsWith(":") ? value.toLowerCase() : `${value.toLowerCase()}:`);

    return hosts.includes(originUrl.host.toLowerCase()) && protocols.includes(originUrl.protocol.toLowerCase());
  } catch {
    return false;
  }
}
