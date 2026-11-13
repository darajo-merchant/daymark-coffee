import type { User } from "@supabase/supabase-js";
import { isAdminAuthenticated } from "../../../../lib/admin-auth";
import { membersAvailable, profileFromUser } from "../../../../lib/member-auth";
import { getSupabaseAdmin } from "../../../../lib/supabase";

const noStore = { "Cache-Control": "no-store" };

async function listAllUsers(): Promise<User[]> {
  const users: User[] = [];
  for (let page = 1; page <= 50; page += 1) {
    const { data, error } = await getSupabaseAdmin().auth.admin.listUsers({ page, perPage: 1000 });
    if (error) throw error;
    users.push(...data.users);
    if (data.users.length < 1000) break;
  }
  return users;
}

function csvCell(value: string | boolean): string {
  const text = String(value);
  // Neutralise spreadsheet formula injection and quote every cell.
  const safe = /^[=+\-@]/.test(text) ? `'${text}` : text;
  return `"${safe.replace(/"/g, '""')}"`;
}

/** Owner-only list of Daymark Circle members, as JSON or a CSV download. */
export async function GET(request: Request) {
  if (!(await isAdminAuthenticated())) return Response.json({ error: "Sign in to view members." }, { status: 401, headers: noStore });
  if (!membersAvailable()) return Response.json({ members: [], available: false }, { headers: noStore });

  try {
    const members = (await listAllUsers())
      .map(profileFromUser)
      .sort((a, b) => b.joinedAt.localeCompare(a.joinedAt));

    if (new URL(request.url).searchParams.get("format") === "csv") {
      const header = ["Name", "Email", "Phone", "Birthday (MM-DD)", "Usual drink", "Wants news", "Email confirmed", "Joined"];
      const rows = members.map((m) => [m.fullName, m.email, m.phone, m.birthday, m.favouriteDrink, m.marketingOptIn ? "yes" : "no", m.emailConfirmed ? "yes" : "no", m.joinedAt.slice(0, 10)]);
      const csv = [header, ...rows].map((row) => row.map(csvCell).join(",")).join("\r\n");
      return new Response(`﻿${csv}`, {
        headers: { ...noStore, "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="daymark-members-${new Date().toISOString().slice(0, 10)}.csv"` },
      });
    }
    return Response.json({ members, available: true }, { headers: noStore });
  } catch {
    return Response.json({ error: "Could not load members." }, { status: 500, headers: noStore });
  }
}
