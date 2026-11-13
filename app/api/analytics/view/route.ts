import { getSupabaseAdmin, isSupabaseConfigured } from "../../../../lib/supabase";

const publicPages = new Set(["/", "/our-story", "/menu", "/visit", "/contact"]);
const noStore = { "Cache-Control": "no-store" };

let warned = false;
function warnOnce(message: string) {
  if (warned) return;
  warned = true;
  console.warn(`[analytics] ${message}`);
}

export async function POST(request: Request) {
  let path: unknown;
  try {
    ({ path } = await request.json());
  } catch {
    return Response.json({ recorded: false }, { status: 400, headers: noStore });
  }

  if (typeof path !== "string" || !publicPages.has(path)) {
    return Response.json({ recorded: false }, { status: 400, headers: noStore });
  }

  if (!isSupabaseConfigured()) {
    return new Response(null, { status: 204, headers: noStore });
  }

  // A missing table/function is a setup issue for the owner, not an error for visitors:
  // skip quietly and leave one hint in the server log.
  try {
    const { error } = await getSupabaseAdmin().rpc("record_site_page_view", { p_page_path: path });
    if (error) warnOnce(`Page views are not being recorded (${error.code ?? "error"}: ${error.message}). Run supabase/schema.sql in the Supabase SQL editor.`);
  } catch (error) {
    warnOnce(`Page views are not being recorded: ${error instanceof Error ? error.message : "unknown error"}.`);
  }

  return new Response(null, { status: 204, headers: noStore });
}
