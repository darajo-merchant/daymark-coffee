import { revalidatePath } from "next/cache";
import { isAdminAuthenticated, requestIsSameOrigin } from "../../../../lib/admin-auth";
import { getSiteContent, saveSiteContent, validateSiteContent } from "../../../../lib/site-content";
import { getSupabaseAdmin, isSupabaseConfigured } from "../../../../lib/supabase";

const noStore = { "Cache-Control": "no-store" };

async function getOverviewMetrics() {
  if (!isSupabaseConfigured()) {
    return { pageViews30d: null, dailyViews: [], viewTrackingReady: false, trackingNeedsSetup: true };
  }

  try {
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    const since = new Date(today);
    since.setUTCDate(since.getUTCDate() - 29);
    const { data, error } = await getSupabaseAdmin()
      .from("site_page_views")
      .select("viewed_on, page_views")
      .gte("viewed_on", since.toISOString().slice(0, 10));

    if (error) {
      return { pageViews30d: null, dailyViews: [], viewTrackingReady: false, trackingNeedsSetup: true };
    }

    const viewsByDay = new Map((data ?? []).map((row) => [row.viewed_on, Number(row.page_views || 0)]));
    const dailyViews = Array.from({ length: 30 }, (_, index) => {
      const date = new Date(since);
      date.setUTCDate(since.getUTCDate() + index);
      const day = date.toISOString().slice(0, 10);
      return { date: day, views: viewsByDay.get(day) ?? 0 };
    });

    return {
      pageViews30d: dailyViews.reduce((total, item) => total + item.views, 0),
      dailyViews,
      viewTrackingReady: true,
      trackingNeedsSetup: false,
    };
  } catch {
    return { pageViews30d: null, dailyViews: [], viewTrackingReady: false, trackingNeedsSetup: true };
  }
}

export async function GET() {
  if (!(await isAdminAuthenticated())) return Response.json({ error: "Sign in to manage the site." }, { status: 401, headers: noStore });
  try {
    const [content, overview] = await Promise.all([getSiteContent(), getOverviewMetrics()]);
    return Response.json({ content, storage: isSupabaseConfigured() ? "supabase" : "local", overview }, { headers: noStore });
  } catch {
    return Response.json({ error: "Saved site content could not be read. Ask your host to check the content file." }, { status: 500, headers: noStore });
  }
}

export async function PUT(request: Request) {
  if (!requestIsSameOrigin(request)) return Response.json({ error: "Request origin could not be verified." }, { status: 403, headers: noStore });
  if (!(await isAdminAuthenticated())) return Response.json({ error: "Your session has expired. Sign in again." }, { status: 401, headers: noStore });
  try {
    const content = validateSiteContent(await request.json());
    await saveSiteContent(content);
    revalidatePath("/");
    revalidatePath("/menu");
    revalidatePath("/visit");
    revalidatePath("/contact");
    return Response.json({ saved: true, storage: isSupabaseConfigured() ? "supabase" : "local" }, { headers: noStore });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not save site information.";
    return Response.json({ error: message }, { status: 400, headers: noStore });
  }
}
